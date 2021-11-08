# Copy License Cloud App
This [Cloud App](https://developers.exlibrisgroup.com/cloudapps/) for Ex Libris Alma allows users to view licenses in another institution and to copy the license to the local institution. It supports the following features:

* Search licenses in remote institution by name, code, or licensor
* View license, including terms and attachments
* Copy license into local institution. 
* Configuration for handling of existing license (DELETED status, etc.)

The app communicates with the remote institution via a proxy. Code and installation instructions for AWS are available in [this Github repository](https://github.com/jweisman/exl-cloudapp-api-proxy). The proxy should be [configured](https://developers.exlibrisgroup.com/alma/apis) with an API key with read-only permissions to the acquisitions area.