FROM ubuntu:18.04
RUN apt-get update
RUN apt-get -y upgrade

# instalar dependencias

RUN apt-get install -y apache2 aptitude npm unzip wget curl git virtualbox
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash
RUN apt-get install -y nodejs libzmq3-dev
RUN node -v
RUN git clone https://github.com/titoshadow/SADlabs.git
RUN ldconfig
RUN cd /SADlabs && npm install

# lanzamos todo 
CMD /etc/init.d/apache2 start
CMD ["node"] ["/SADlabs/dmserver.js 127.0.0.1 6544 9999 127.0.0.1:8888,127.0.0.1:7777"]
CMD ["node"] ["/SADlabs/dmforum.js 127.0.0.1 6544 8888 3211"]
CMD ["node"] ["/SADlabs/dmserver.js 127.0.0.1 6545 8888 127.0.0.1:9999,127.0.0.1:7777"]
CMD ["node"] ["/SADlabs/dmforum.js 127.0.0.1 6545 9999 3212"]
CMD ["node"] ["/SADlabs/dmserver.js 127.0.0.1 6546 7777 127.0.0.1:8888,127.0.0.1:9999"]
CMD ["node"] ["/SADlabs/dmforum.js 127.0.0.1 6546 7777 3213"]
