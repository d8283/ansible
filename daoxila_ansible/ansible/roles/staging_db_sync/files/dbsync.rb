require 'yaml'

class Sync
    attr_accessor :name, :host, :user, :pass
    attr_accessor :remote_host, :remote_user, :remote_pass

    attr_accessor :default_data, :table_no_data, :table_data

    attr_accessor :all_tables, :tables

    def initialize
        @default_data = false
        @table_no_data = []
        @table_data = []

        @all_tables = true
        @tables = []
    end

    def sync
        cmds = []

        cmd = "mysqldump"
        cmd += " -h#{@remote_host} -u#{@remote_user} -p#{@remote_pass}"
        cmd += " -C"
        cmd += " --skip-triggers --skip-lock-tables --no-data --set-gtid-purged=OFF"
        cmd += " --single-transaction"
        cmd += " #{@name}"

        if not @all_tables
            cmd += " " + @tables.join(" ")
        end

        cmd += " | sed -e s/AUTO_INCREMENT=[0-9][0-9]*// > /root/dbsync/tmp/#{@name}.sql";

        cmds << cmd

        if @default_data or not @table_data.empty?
            cmd = "mysqldump"
            cmd += " -h#{@remote_host} -u#{@remote_user} -p#{@remote_pass}"
            cmd += " -C"
            cmd += " --skip-triggers --skip-lock-tables --no-create-info --set-gtid-purged=OFF"
            cmd += " --single-transaction"

            if @default_data
                @table_no_data.each do |t|
                    cmd += " --ignore-table=#{@name}.#{t}"
                end
            end

            cmd += " #{@name}"

            if not @default_data and not @table_data.empty?
                cmd += " " + @table_data.join(" ")
            end

            cmd += " >> /root/dbsync/tmp/#{@name}.sql"

            cmds << cmd

        end

        cmds << "mysql -h#{@host} -u#{@user} -p#{@pass} -e 'drop database if exists #{@name}'"
        cmds << "mysql -h#{@host} -u#{@user} -p#{@pass} -e 'create database #{@name}'"
        cmds << "mysql -h#{@host} -u#{@user} -p#{@pass} #{@name} < /root/dbsync/tmp/#{@name}.sql"

        cmds
    end
end

conf_file = '/root/dbsync/dbsync.yml'
root = YAML.load_file(conf_file)

raise "must set db_host" if root["db_host"].empty?
raise "must set db_user" if root["db_user"].empty?
raise "must set db_pass" if root["db_pass"].empty?

syncs = []

root["databases"].each do |name, conf|
    host = conf["host"]

    sync = Sync.new
    sync.name = name
    sync.host = root["db_host"]
    sync.user = root["db_user"]
    sync.pass = root["db_pass"]
    sync.remote_host = root["hosts"][host]["host"]
    sync.remote_user = root["hosts"][host]["user"]
    sync.remote_pass = root["hosts"][host]["pass"]

    raise "must set default_data, name=#{name}" if conf["default_data"].nil?

    sync.default_data = conf["default_data"]

    sync.table_no_data = conf["table_no_data"] if conf["table_no_data"]
    sync.table_data = conf["table_data"] if conf["table_data"]
    sync.tables = conf["tables"] if conf["tables"]

    syncs << sync
end

File.open("/root/dbsync/tmp/run", "w") do |file|
    file.write("set -e\n")

    syncs.each do |s|
        s.sync.each do |cmd|
            file.write(cmd + "\n")
        end
    end
end

`bash /root/dbsync/tmp/run`

exit $?.to_i
