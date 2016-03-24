#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  fileRename.py
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
#  Created by: Austin Holler
#  Date: Mar 24, 2016
#  Purpose: Simple batch file renaming script
#  
#  

import os

def main():
	
	fileList = os.listdir('LrgCityEvents')
	off = 0
	
	for x in fileList:
		
		off += 1
		os.rename('LrgCityEvents/{}'.format(x), 'LrgCityEvents/New_York-NYEvents{}.json'.format(off)) 
	
	return 0

if __name__ == '__main__':
	main()

