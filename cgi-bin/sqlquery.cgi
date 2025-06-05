#!/bin/bash

declare -A post

while IFS= read -d = var; do
  IFS= read -d '&' value
  post[$var]=$value
done

user=${post[user]}
db=${post[db]}
command=${post[command]}
# TODO make an argument?
PGHOST=192.168.10.17

#DEBUGFILE=/tmp/sqlquery.cgi.log
DEBUGFILE=/dev/null
ERR=$( (echo "got request with user: '${user}', db: '${db}', '${command}'" >> ${DEBUGFILE}) 2>&1)
#logger -p local0.notice -t ${0##*/}[$$] sql query ${command} to debugfile ${DEBUGFILE} returned $? with ${ERR}
# this was failing due to "out of disk space"

query=$(echo -e "${command//%/\\x}")
echo "decoded query: '${query}'" >> ${DEBUGFILE}

echo 'Content-type: text/html'

RET=$(psql -h ${PGHOST} ${user:+-U "$user"} \
     ${db:+-d "$db"} \
     -H \
     -T id=table \
     -c "${query}" \
     2>&1)
echo "query return: '${RET}'" >> ${DEBUGFILE}

echo ${RET} |
#FIXME better error
exec sed '
  1{
    /^ERROR/{
      iStatus: 400
    }
    i
  }
'
