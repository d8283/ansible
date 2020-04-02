#!/bin/bash

projects=(
answer
cs
hunqing
m
m-my
minisite
pay
story
v3
www
b
event
info
m-b
m-wedding
miyue
phone
sys
wap
buy
hunche
kiss
m-bbs
m-www
my
public
tools
web
cms
hunpin
login
m-hunqing
mall
order
root
un
wedding
)

function make_yml() {
    echo "---
- include: html_static.yml
  vars:
    project: html_static_$1
" > "html_static_$1.yml"    
}

for p in ${projects[@]}; do
    make_yml $p
done
