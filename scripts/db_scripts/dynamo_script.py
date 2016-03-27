import os, json
from boto import dynamodb2
from boto.dynamodb2.table import Table
from decimal import Decimal
import sys

# Print iterations progress
def printProgress (iteration, total, prefix = '', suffix = '', decimals = 2, barLength = 100):
    """
    Call in a loop to create terminal progress bar
    @params:
        iterations  - Required  : current iteration (Int)
        total       - Required  : total iterations (Int)
        prefix      - Optional  : prefix string (Str)
        suffix      - Optional  : suffix string (Str)
    """
    filledLength    = int(round(barLength * iteration / float(total)))
    percents        = round(100.00 * (iteration / float(total)), decimals)
    bar             = '#' * filledLength + '-' * (barLength - filledLength)
    sys.stdout.write('%s [%s] %s%s %s\r' % (prefix, bar, percents, '%', suffix)),
    sys.stdout.flush()
    if iteration == total:
        print("\n")

#AWS Connection String
REGION = "us-west-2"
conn = dynamodb2.connect_to_region(
    REGION,
    aws_access_key_id='xxxxxxxxxxxxx',
    aws_secret_access_key='xxxxxxxxxxxxxxxx',
)

#DynamoDB Table
topics = Table(
    'topics_DEN',
    connection=conn
)

#Input json file name
js = sys.argv[1]

#Loading data in Tables
with open(js) as json_file :
          data = json.load(json_file)
	  size = len(data)
	  i = 0
	  printProgress(i, size, prefix = 'Data', suffix = 'Complete', barLength = 50)
          for date in data:
	     try :
                for topic in data[date] : 
                	topics.put_item(data={'Id': data[date][topic]["topic_id"]  ,'Name' : topic , 'Category' : data[date][topic]['category'] ,'Date' : date, 'Score' : Decimal(str(data[date][topic]["score"])) } )
	                #print data[date][topic]["topic_id"]  , topic ,data[date][topic]["category"] ,  date
	     except : 
		pass
	     printProgress(i, size, prefix = 'Data', suffix = 'Complete', barLength = 50)
             i += 1
