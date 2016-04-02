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

import urllib
import json
import time
import os
import math


def getUSEvents():
	
	off = 0
	current_time = int (round(time.time()))*1000
	tomorrow = current_time - 86400000
	happy= "Digital Photography"

	json_str = urllib.urlopen('https://api.meetup.com/2/open_events?key=80248d92f41752948556153452941&sign=true&photo-host=public&country=us&city=denver&state=co&time={},{}&topic={}&page=200&radius=15.0'.format(tomorrow, current_time, happy)).read()
	print(json_str)
	parsed_json = json.loads(json_str)
	
			
	arr_len = len(parsed_json['results'])
			
	#for x in xrange(arr_len):
		#print parsed_json

			
	while (parsed_json['meta']['next']): #and (parsed_json['results'][arr_len - 1]['members'] > 99)):
				
		#go to the next page
		off += 1
				
		json_str = urllib.urlopen('https://api.meetup.com/2/open_events?key=80248d92f41752948556153452941&sign=true&photo-host=public&country=us&offset={}&city=denver&state=co&time={},{}&page=200&radius=15.0'.format(off, current_time, tomorrow)).read()
		parsed_json = json.loads(json_str)
				
		arr_len = len(parsed_json['results'])
			
		#for x in xrange(arr_len):
			
		#sleep prevents overuse of the API (200 calls/hr)
		time.sleep(.40)
		
	
	return 0


def main():
	
	
	
	
	getUSEvents()
	
	return 0

if __name__ == '__main__':
	main()
