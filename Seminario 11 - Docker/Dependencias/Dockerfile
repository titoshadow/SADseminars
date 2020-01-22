FROM ubuntu:18.04
RUN apt-get update
RUN apt-get -y upgrade

# instalar dependencias
RUN apt-get install -y apache2 aptitude npm unzip wget curl git virtualbox
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash
RUN apt-get install nodejs
RUN node -v
RUN git clone https://github.com/titoshadow/SADlabs.git
RUN ldconfig
RUN cd /SADlabs && npm install

# lanzamos todo 
CMD /etc/init.d/apache2 start
CMD ["node"] ["/SADlabs/dmserver.js 127.0.0.1 10000 11000 127.0.0.1:11001,127.0.0.1:11002"]
CMD ["node"] ["/SADlabs/dmforum.js 127.0.0.1 10000 11001 12000"]
CMD ["node"] ["/SADlabs/dmserver.js 127.0.0.1 10001 11001 127.0.0.1:11000,127.0.0.1:11002 "]
CMD ["node"] ["/SADlabs/dmforum.js 127.0.0.1 10001 11000 12001"]
CMD ["node"] ["/SADlabs/dmserver.js 127.0.0.1 10002 11002 127.0.0.1:11001,127.0.0.1:11000"]
CMD ["node"] ["/SADlabs/dmforum.js 127.0.0.1 10002 11002 12002"]
