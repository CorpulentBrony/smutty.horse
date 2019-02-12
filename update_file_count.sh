#!/bin/bash
databaseName="pomf";
directory="/var/www/html/smutty.horse/";
destinationFileName="file_count.txt";
passwordConfigFileName="smutty_db_password.cnf";
sqlCommand="select count(*) - 1, sum(size) from files;";
userName="smutty";

destination="${directory}${destinationFileName}";
passwordConfig="${directory}${passwordConfigFileName}";
result=($(mysql --defaults-extra-file="${passwordConfig}" ${databaseName} -u ${userName} -N -r -s -e "${sqlCommand}"));
mebibytes=$(echo "scale=2; print ${result[1]} / 1024 ^ 2" | bc -l);
echo -n "<data itemprop=\"userInteractionCount\" value=\"${result[0]}\">${result[0]}</data> files (<data value=\"${result[1]}\">${mebibytes}&nbsp;MiB</data>)"  > "${destination}";