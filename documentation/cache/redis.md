# connect to redis: 
1. connect to ec2
2. cd to /home/ec2-user/redis-stable
3. `src/redis -cli -h [redis-url] -p 6379

# add element to redis: 
set testkey "testvalue"

# get element from redis: 
get testkey


