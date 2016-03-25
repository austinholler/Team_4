import os, json
from boto import dynamodb2
from boto.dynamodb2.table import Table
from decimal import Decimal

REGION = "us-west-2"
conn = dynamodb2.connect_to_region(
    REGION,
    aws_access_key_id='xxxxxxxxxxxxx',
    aws_secret_access_key='xxxxxxxxxxxxxxxxxxxx',
)
topics = Table(
    'topics_DEN',
    connection=conn
)
path_to_json = '/path/to/json_dir/'
json_files = [pos_json for pos_json in os.listdir(path_to_json) if pos_json.endswith('.json')]
f = 0
for js in json_files :
      f += 1
      with open(os.path.join(path_to_json, js)) as json_file :
          data = json.load(json_file)
          for date in data:
                for topic in data[date] : 
                	topics.put_item(data={'Id': data[date][topic]["topic_id"]  ,'Name' : topic , 'Category' : data[date][topic]['category'] ,'Date' : date, 'Score' : Decimal(str(data[date][topic]["score"])) } )
	                #print data[date][topic]["topic_id"]  , topic ,data[date][topic]["category"] ,  date
      print 'Files Completed:' + str(f*100.0/len(json_files))
