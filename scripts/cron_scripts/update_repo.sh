#!/bin/bash
cur_date=`date`;
echo "cron job pulled new repo: $cur_date" >> /home/ec2-user/Team_4/logs/cron_log.txt 
cd /home/ec2-user/Team_4
git pull

