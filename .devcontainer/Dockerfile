FROM tiryoh/moddable-esp32:latest

RUN curl -SL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get update && apt-get install -y nodejs \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*

RUN echo 'source $IDF_PATH/export.sh' >> /root/.bashrc