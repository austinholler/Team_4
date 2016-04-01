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
    aws_access_key_id='xxxxxxxxxxxxxx',
    aws_secret_access_key='xxxxxxxxxxxxxxxxxxxx',
    is_secure = False,
)

#DynamoDB Table
if len(sys.argv) < 3:
    sys.exit('Usage: %s CityCode Filepath' % sys.argv[0])

topics = Table(
    'topics_' + sys.argv[1],
    connection=conn
)

#Input json file name
js = sys.argv[2]

#Loading data in Tables
with open(js) as json_file :
          data = json.load(json_file)
	  size = len(data)
	  i = 0
	  printProgress(i, size, prefix = 'Data', suffix = 'Complete', barLength = 50)
          for date in data:
		topics_list = []
                for index,topic in enumerate(data[date]) :
		   topics_list.append(str(data[date][topic]["topic_id"]) + '#' + topic + '#' + data[date][topic]['category'] + '#' + date + '#' + str(data[date][topic]["score"]))
                   if len(topics_list) == 20 or index == len(data[date]) - 1 :
                     try:
                        with topics.batch_write() as batch:
                            for item in topics_list:
				items = item.split('#')
                                batch.put_item(data={'Id': items[0] ,'Name' : items[1] , 'Category' : items[2] ,'Date' : items[3] ,'Score': Decimal(items[4])})
                            	#print items
			    topics_list = []
                     except :
                            print sys.exc_info()[0]

		printProgress(i, size, prefix = 'Data', suffix = 'Complete', barLength = 50)
                i += 1
