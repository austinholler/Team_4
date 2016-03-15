import os, json
from boto import dynamodb2
from boto.dynamodb2.table import Table

REGION = "us-west-2"

conn = dynamodb2.connect_to_region(
    REGION,
    aws_access_key_id='xxxxxxxxx',
    aws_secret_access_key='xxxxxxxxxxxxxxx',
)
events = Table(
    'events',
    connection=conn
)
groups = Table(
    'groups',
    connection=conn
)

path_to_json = '/home/user/Desktop/'
json_files = [pos_json for pos_json in os.listdir(path_to_json) if pos_json.endswith('Groups2.json')]
num_files = len(json_files)
f = 0
for js in json_files : 
      f += 1
      with open(os.path.join(path_to_json, js)) as json_file :
	  data = json.load(json_file)
          arrlen = len(data['groups'])
          for x in range(arrlen): 
	        groups.put_item(data={'id': data['groups'][x]['id'],'city' : data['groups'][x]['city'] ,'state' : data['groups'][x]['state'] , 'country' : data['groups'][x]['country'], 'members' : data['groups'][x]['members'], 'rating' : str(data['groups'][x]['rating']) , 'name' : data['groups'][x]['name'], 'link' : data['groups'][x]['link']})
		#print data['groups'][x]['id'] , data['groups'][x]['city'] , data['groups'][x]['state'] , data['groups'][x]['country'] , data['groups'][x]['members'],data['groups'][x]['rating'],data['groups'][x]['name'],data['groups'][x]['link']
		print 'Groups Completed:' + str(f*100.0/num_files)

json_files = [pos_json for pos_json in os.listdir(path_to_json) if pos_json.endswith('Events.json')]
num_files = len(json_files)
f = 0
for js in json_files :
      f += 1
      with open(os.path.join(path_to_json, js)) as json_file :
          data = json.load(json_file)
          arrlen = len(data['events'])
          for x in range(arrlen):
                events.put_item(data={'id': data['events'][x]['id'],'city' : data['events'][x]['city'] ,'state' : data['events'][x]['state'] , 'yes_rsvp_count' : data['events'][x]['yes_rsvp_count'], 'category' : data['events'][x]['group']['category']['name'] , 'name' : data['events'][x]['name'], 'event_url' : data['events'][x]['event_url'], 'time' : data['events'][x]['time'], 'utc_offset' : data['events'][x]['utc_offset'], 'group_id' : data['events'][x]['group']['id'] })
		#print data['events'][x]['id'],data['events'][x]['city'] ,data['events'][x]['state'] , data['events'][x]['yes_rsvp_count'], data['events'][x]['group']['category']['name'] , data['events'][x]['name'], data['events'][x]['event_url'], data['events'][x]['time'], data['events'][x]['utc_offset'], data['events'][x]['group']['id']
		print 'Events Completed:' + str(f*100.0/num_files)
