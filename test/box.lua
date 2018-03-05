#!/usr/bin/env tarantool
box.cfg{
    listen=3301
}

box.schema.user.drop('test',{if_exists=true})
box.schema.user.create('test', { password = 'pass' })
box.schema.user.grant('test', 'read', 'space', '_space')
box.schema.user.grant('test', 'read', 'space', '_index')
box.schema.user.grant('test', 'execute', 'universe')

if box.space.test then
    box.space.test:drop()
end

if not box.space.test then
    local test = box.schema.space.create('test')
    test:create_index('primary',   {type = 'TREE', unique = true, parts = {1, 'UNSIGNED'}})
    test:create_index('secondary', {type = 'TREE', unique = false, parts = {2, 'STR'}})

    test:insert{495,'created'}

    test:insert{496,'created'}

    test:insert{498,'created'}

    test:insert{499,'created'}


    box.schema.user.grant('test', 'read,write,execute', 'space', 'test')
end
