#!/bin/bash

sudo apt-get -y install curl

curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.4.9.tgz
tar -zxvf mongodb-linux-x86_64-3.4.9.tgz
export PATH=/home/vagrant/mongodb-linux-x86_64-3.4.9/bin:$PATH
sudo mkdir -p /data/db
sudo chmod 777 /data/db



#cd home/vagrant/mongodb-linux-x86_64-3.4.9/bin
#cp domongo.sh /home/vagrant
sudo chmod 777 /home/vagrant/domongo.sh
./domongo.sh --rest

