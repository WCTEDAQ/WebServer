#/bin/bash

#QUERY_STRING=${QUERY_STRING:-"a=last_trace"}
QUERY_STRING="100"

if [ -n ${QUERY_STRING} ]; then
	
	declare -A post
	while IFS= read -d = var; do
		IFS= read -d '&' value
		post[$var]=$value
	done
	nfiles=${post[nfiles]}
	
else
	
fi

if [ -z ${nfiles} ]; then
	nfiles=100
fi

echo 'Content-type: text/html'
ls -ltrh /web/Data | tail -n ${nfiles}
