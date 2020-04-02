到喜啦Ansible部署
=================
---
环境 - Inventories
---
* staging 预发布环境
* production_jurassic 使用ansible之前的老生产环境
---

使用
---

# 部署环境
---
作用是部署项目运行的环境

## 部署所有环境
```sh
ansible-playbook -i <env> playbooks/site.yml
```
将<env>替换为目标环境

## 部署局部系统
```sh
ansible-playbook -i <env> playbooks/<playbook>.yml
```
各个<playbook>的说明在yml文件中

---

# 发布代码
---
作用是上线代码

```sh
ansible-playbook -i <env> playbooks/deploy_<project>.yml
```

---

开发
---

这里假设阅读者对ansible有基本的了解。ansible文档在[这里](http://docs.ansible.com/ansible/index.html)。

## 目录结构
---
```
|-ansible.cfg                     # ansible配置文件
|-filter_plugins/                 # j2模版引擎的自定义filter
|-library/                        # ansible扩展模块
|-playbooks/                      # playbook
|-production_jurassic/            # 老生产环境
|-roles/                          # 角色
|-staging/                        # 预发布环境
```

## 组 - Groups
---
组的定义在环境目录下inventory文件中，与该文件同级目录的group_vars目录中是组变量定义（参见[文档](http://docs.ansible.com/ansible/playbooks_best_practices.html)）。

## 角色 - Roles
---
各个角色的文档在其代码中(roles/*/tasks/main.yml)

## Playbook
---
各个playbook的文档在其代码中

# 搭建ansible运行环境
在ansible运行的节点上需要能够ssh到目标节点，这可以由两种方式满足，一是在目标节点同一网段执行
ansible，二是通过跳板机。另外，为了执行效率，需要开启ssh的multiplexing功能。这两点可以通过
~/.ssh/config文件来实现，示例如下

```
Host bastion
    User                   botao
    HostName               192.168.2.35
    ProxyCommand           none
    IdentityFile           /vagrant/botao.pem
    BatchMode              yes
    PasswordAuthentication no

Host 192.168.8.*
    ServerAliveInterval    60
    TCPKeepAlive           yes
    ProxyCommand           ssh -qaY bastion 'nc -w 14400 %h %p'
    ControlMaster          auto
    ControlPath            ~/.ssh/mux-%r@%h:%p
    ControlPersist         8h
    User                   root
    IdentityFile           /vagrant/bastion.pem
```

其中第一段是跳板，第二段定义通过跳板登录8段的节点
