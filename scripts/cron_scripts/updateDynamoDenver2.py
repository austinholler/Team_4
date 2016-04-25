#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  updateDynamo.py
#  
#  Copyright 2016 user <user@cu-cs-vm>
#  
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#  
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#  
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#  MA 02110-1301, USA.
#
#  Created by: Andrew Candelaresi
#  Date: Mar 25, 2016
#  Purpose: Process a Meetups cities events into a usable format of data,
#			that can be uploaded to dynamoDB, and shows a topics 
#			popularity on any given date.
#    
from __future__ import print_function # Python 2/3 compatibility
import boto3
import decimal
import urllib
import time
import math
import os, json
from boto import dynamodb2
from boto.dynamodb2.table import Table
from decimal import Decimal
import sys
import decimal
from time import sleep
from boto3.dynamodb.conditions import Key, Attr

# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)
        
#AWS Connection String
REGION = "us-west-2"
conn = dynamodb2.connect_to_region(
    REGION,
    aws_access_key_id='AKIAITWE64NY2AV6IBEA',
    aws_secret_access_key='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',
    is_secure = False,
)

#DynamoDB Table
topics = Table(
    'Topics',
    connection=conn
)
Cities = Table(
    'Cities',
    connection=conn
)
def getUSEvents():
    off = 0
    current_time = int (round(time.time()))*1000
    tomorrow = current_time + 86400000
    #scan our cities table to get all cities to update
    # Get the name of all cities. 
    cityList = Cities.scan()
    for city in cityList:
        name = city['name']
        state = city['state']
        name = name.lower()
        state = state.lower()
        print(name, state)
        json_str = urllib.urlopen('https://api.meetup.com/2/open_events?key=80248d92f41752948556153452941&sign=true&photo-host=public&country=us&city={}&state={}&fields=topics,category&time={},{}&omit=description,how_to_find_us,&page=200&radius=15.0'.format(name, state, current_time, tomorrow)).read()
        parsed_json = json.loads(json_str)
        arr_len = len(parsed_json['results'])
    
        while (parsed_json['meta']['next']): #and (parsed_json['results'][arr_len - 1]['members'] > 99)):
        		
            #go to the next page
            off += 1
            print(off)
            json_str = urllib.urlopen('https://api.meetup.com/2/open_events?key=80248d92f41752948556153452941&sign=true&photo-host=public&country=us&offset={}&city={}&state={}&fields=topics,category&time={},{}&omit=description,how_to_find_us,&page=200&radius=15.0'.format(off, name, state, current_time, tomorrow)).read()
            parsed_json = json.loads(json_str)
        
            #sleep prevents overuse of the API (200 calls/hr)
            time.sleep(.40)
    return (parsed_json)

def processJson(parsed_json):
    
    #Create a dictionary, later turned into the JSON object/file
    topic_dict = {}
    
    #Create total events/rsvps keys for later use	
    topic_dict['num_events'] = 0
    topic_dict['total_rsvps'] = 0
    
    arr_len = len(parsed_json['results'])
    
    #Iterating through each event in event JSON file for processing
    for x in xrange(arr_len):
        event = parsed_json['results'][x]
        #Keeping events w/no attendance out
        if event['yes_rsvp_count']:
            #Converts milliseconds since epoch to when event occured
            secs = (event['time'] + event['utc_offset'])/1000
            time_struct = time.gmtime(secs)
            date_format = time.strftime("%d-%m-%Y", time_struct)
            
            #Add to total event and rsvp count for later use
            topic_dict['num_events'] += 1
            topic_dict['total_rsvps'] += event['yes_rsvp_count']
            
            #Check for converted date in the dict
            if not date_format in topic_dict:
                
                #Date key added to new dict w/a dict as value	
                topic_dict[date_format] = {}
                
                #Iterate through an events topics	
                for topic in event['group']['topics']:       
                    #Check for topic key in above date dict
                    if not topic['urlkey'] in topic_dict[date_format]:
                        	
                        #Topic key created and value added
                        topic_dict[date_format][topic['urlkey']] = {}
                        topic_dict[date_format][topic['urlkey']]['topic_id'] = topic['id']
                        
                        #Check for existence of 'category' in the current event
                        #Apparently some groups/events aren't categorized
                        if 'category' in event['group']:
                            
                            #Added category name/id to the above date dict
                            topic_dict[date_format][topic['urlkey']]['category'] = event['group']['category']['shortname']
                            topic_dict[date_format][topic['urlkey']]['category_id'] = event['group']['category']['id']
                            
                        #Else create a null category name/id as holder
                        else:
                            topic_dict[date_format][topic['urlkey']]['category'] = 'null'
                            topic_dict[date_format][topic['urlkey']]['category_id'] = 'null'
                            
                        #Add a score to the new topic based on rsvps
                        topic_dict[date_format][topic['urlkey']]['score'] = event['yes_rsvp_count']
                    
                    #Else add to dates topic score based on rsvps	
                    else:
                        topic_dict[date_format][topic['urlkey']]['score'] += event['yes_rsvp_count']
            
            #Date key's in created dictionary; the same basic process is
            #followed as above but adding to date instead of creating it
            else:
                for topic in event['group']['topics']:                
                   if not topic['urlkey'] in topic_dict[date_format]:
                       topic_dict[date_format][topic['urlkey']] = {}
                       topic_dict[date_format][topic['urlkey']]['topic_id'] = topic['id']
                       if 'category' in event['group']:
                           topic_dict[date_format][topic['urlkey']]['category'] = event['group']['category']['shortname']
                           topic_dict[date_format][topic['urlkey']]['category_id'] = event['group']['category']['id']
                       else:
                           topic_dict[date_format][topic['urlkey']]['category'] = 'null'
                           topic_dict[date_format][topic['urlkey']]['category_id'] = 'null'
                       topic_dict[date_format][topic['urlkey']]['score'] = event['yes_rsvp_count']
                   else:
                       topic_dict[date_format][topic['urlkey']]['score'] += event['yes_rsvp_count']
                       
    #Create a pretty json object and write new JSON file	
    #cityEvents = json.dumps(topic_dict, sort_keys=True, indent=4, separators=(',', ': '))
    
    
    #Assign total events/rsvps variables
    total_events = topic_dict['num_events']
    total_rsvps = topic_dict['total_rsvps']
	
    #Determine the population mean
    mean = total_rsvps/total_events
	
    #Delete the keys, they're no longer needed
    del topic_dict['num_events']
    del topic_dict['total_rsvps']
    
    #Declare variance numerator and denominator	
    var_num = 0
    var_den = 0
    
    #First loop through data to determine population variance		
    for entry in topic_dict:
        for topic in topic_dict[entry]:
            var_num += topic_dict[entry][topic]['score']**2
            var_den += 1
    
    #Declare and calculate population deviation (i.e. sqrt variance)
    deviation = math.sqrt(var_num/var_den)
    
    #Second loop through data to update score to a normalized z-score
    # z-score = absolute value of (score - pop. mean)/pop. deviation	
    for entry in topic_dict:
        for topic in topic_dict[entry]:
            topic_dict[entry][topic]['score'] = abs((topic_dict[entry][topic]['score'] - mean)/deviation)
            
    #Create a pretty json, overwrite old JSON w/new JSON object
    cityEvents = json.dumps(topic_dict, sort_keys=True, indent=4, separators=(',', ': '))
    post_file = open('Denver', 'a')
    post_file.write(cityEvents)
    print('dude your getting a del')
	
    return cityEvents
	
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
        


def loadToDB(parsed_json):
    print('hi4')
    data = json.loads(parsed_json)
    items =1
    size = len(data)
    i = 0
    
    topics_list = []
    for date in data:
        topics_list = []
        for index,topic in enumerate(data[date]) :
            topics_list.append(str(data[date][topic]["topic_id"]) + '#' + topic + '#' + data[date][topic]['category'] + '#' + ''.join(reversed(date.split('-'))) + '#' + str(data[date][topic]["score"]))
            if len(topics_list) == 10 or index == len(data[date]) - 1 :
            # try:
                with topics.batch_write() as batch:
                   for item in topics_list:
                        items = item.split('#')
                        batch.put_item(data={'Name' : items[1] , 'Category' : items[2] ,'Date' : 'DEN' + items[3] ,'Score': Decimal(items[4])})
                        print (items)
                   topics_list = []
                   sleep(0.18)
            #except :
                 #print (sys.exc_info()[0], items)

    printProgress(i, size, prefix = 'Data', suffix = 'Complete', barLength = 50)
    i += 1
    return 0
	
	
def main():
	
	
	
	
	toProcess = getUSEvents()
	normalizedData = processJson(toProcess)
	loadToDB(normalizedData)
	
	return 0

if __name__ == '__main__':
	main()
