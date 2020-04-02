module.exports = function (type) {
    return {
        "hotelbiz": "酒店",
        "photobiz": "婚纱摄影",
        "storycontent": "结婚故事内容",
        "photogoods": "婚纱套系",
        "photoalbum": "婚纱案例",
        "hunpingoods": "婚品",
        "ceremonyalbum": "婚庆案例",
        "ceremonyplan": "婚庆套系",
        "photocustomeralbum": "婚纱客照",
        "ceremonybiz": "婚庆商户",
        "storyarticle": "结婚故事",
        "huncheserie": "婚车",
        "clothinggoods": "礼服套系",
        "honeymoonplan": "蜜月套系",
        "clothingbiz": "礼服商户",
        "honeymoonbiz": "蜜月商户",
    }[type] || type;
};
