FROM tiryoh/moddable-esp32:OS201127

RUN curl -SL https://deb.nodesource.com/setup_12.x | bash
RUN apt-get update && apt-get install -y nodejs \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*