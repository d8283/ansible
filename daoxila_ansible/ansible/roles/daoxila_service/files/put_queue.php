<?php
require getenv('ENV_PATH');
date_default_timezone_set('Asia/Shanghai');

$limit_config = 1;
$limit_time = 300;
$limit_count = 5;

$tpl_key = 'base_sms_content';
$tpl_key_ttl = 3600;

$keys = array('7f92294a25e4f3de065f2b325a113acb', 'pm0MLbRZkTG8XMoJHnscdQ07PqhJOx');
parse_str(file_get_contents('php://input', 'r'), $_POST);
$post_key = isset( $_POST['key'] ) ? $_POST['key'] : false;
$auth_id = isset( $_POST['auth_id'] ) ? intval($_POST['auth_id']) : 0;
$sms_type = isset( $_POST['sms_type'] ) ? $_POST['sms_type'] : 0;
$to_who = isset( $_POST['mobile'] ) ? $_POST['mobile'] : false;
$limit_key = "Sms_".$to_who;
$sms_content = isset( $_POST['content'] ) ? str_replace(" ", "", $_POST['content']) : false;

$ret = array();
/*
if( !in_array($post_key, $keys) ) {
    $ret['code'] = -1;
    $ret['msg'] = 'key is incorrect';
    echo json_encode($ret);
    return;
}
*/

if( strlen(trim($to_who)) != 11 ) {
                $ret['code'] = -3;
                $ret['msg'] = 'mobile is incorrect';
                echo json_encode($ret);
                return;
}

if (strlen(trim($sms_content)) < 2 ) {
                $ret['code'] = -4;
                $ret['msg'] = 'sms content is incorrect';
                echo json_encode($ret);
                return;
}

$sms_content_tpl = preg_replace( '/\d{11}/', '{mobile}', $sms_content );
$sms_content_tpl = preg_replace( '/\d{6}/', '{number_6}', $sms_content_tpl );
$sms_content_tpl = preg_replace( '/商户伙伴“(.+?)”/i', '商户伙伴“{username}”', $sms_content_tpl );

$redis = new Redis();
$redis->connect(REDIS_SERVER, 6379, 60);
$redis->select(8);

$tpl_res = unserialize($redis->get($tpl_key));
if ($tpl_res) {
        $base_sms_arr = $tpl_res;
} else {
        require_once('base_sms.php');
        $redis->setex($tpl_key, $tpl_key_ttl, serialize($base_sms_arr));
}
$sms_type = ( in_array($sms_content_tpl, $base_sms_arr) && !$sms_type ) ? 4 : $sms_type;

$link = mysql_connect(DB_MAIN_MASTER_HOST, DB_MAIN_MASTER_USER, DB_MAIN_MASTER_PWD);
mysql_select_db(DB_API_DBNAME);
mysql_query('set names utf8');

$msg_length = _strlen($sms_content) + 5;
$msg_count = $msg_length > 70 ? ceil($msg_length / 67) : ceil($msg_length / 70);
$create_time = time();
$priority = 0;
if(isset($_POST['priority'])){
        $priority = intval($_POST['priority']);
}

if ( $sms_type === 4 && $limit_config ) {
        $limit_res = $redis->hGetAll($limit_key);

        if ( !$limit_res || time() > $limit_res['time'] ) {
                $redis->hMset($limit_key, array('time' => time() + $limit_time, 'count' => 1));
        } else {
                $redis->hset($limit_key, 'count', $limit_res['count'] + 1);
        }

        if ( $limit_res['time'] >= time() && $limit_res['count'] >= $limit_count ) {
                $ret['code'] = -2;
                $ret['msg'] = 'mobile limited';
                echo json_encode($ret);
                $sql = "INSERT INTO `ex_limit_sms` (`auth_id`, `mobile`, `content`, `created`) VALUES ($auth_id, $to_who, '$sms_content', $create_time)";
        } else {
                $sql = "INSERT INTO `ex_sms_quene` ( id, auth_id, mobile, content, create_time, msg_length, msg_count, priority, sms_type ) VALUES ( 0, $auth_id, $to_who, '$sms_content', $create_time, $msg_length, $msg_count, $priority, $sms_type )";
        }
} else {
        $sql = "INSERT INTO `ex_sms_quene` ( id, auth_id, mobile, content, create_time, msg_length, msg_count, priority, sms_type ) VALUES ( 0, $auth_id, $to_who, '$sms_content', $create_time, $msg_length, $msg_count, $priority, $sms_type )";
}

$res = mysql_query($sql,$link);
$id = mysql_insert_id();

if($res && $id>0){
                mysql_close($link);
                $ret['code'] = 1;
                $ret['id'] = $id;
                $ret['msg'] = 'send successful';
                //echo json_encode($ret);
                return;
}

function _strlen($string = null) {
        preg_match_all("/./us", $string, $match);
        return count($match[0]);
}