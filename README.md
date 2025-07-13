# SnipSight
An Application with custom URL Shortner and File Sharing  with Key Insights 

## High Level Design
![High Level Architecture](assets/Highlevel.drawio%20%282%29.png)





## Project Design
Actually we will design whole microservice in a single project by creating multiple proto files, each acts
as a single server and we run a run server of that port in each and every machine. But when we are using
different languages , then it's not possible. so we have created multiple projects. so in each project we
use only single proto file. if in that specific project , if we want to grow it down we can split them into
multiple projects by creating multiple proto files , which creates multiple servers. If we are using whole
only one language Rust , then we can create a single cargo project and we can create multiple proto files
like authentication.proto , url_shortner.proto, payment.proto, file_sharing.proto , in this way where in a
single EC2 instance we can run it a particular port with out running all. In this way we can work on. But know
we are just using different languages for each service, so for a service we can go for only one proto file,in case
in future need scale further more then we can create more proto files and split the existing application in a better 
way.


## KEY FEATURES
-> Url Shortner Service is capable of creating shorten urls with custom names, and also we can get key insights
when some one clicked the link like Ip address, source domain, device-type, geo-location, total count, timestamp.

-> FileSharing service is capable of Storing large files and also able to share large files in a secure way, where
can create a one time link with no screenshot option as well, and you can create a public sharable link, where in those
situation you will get key insights like for the url Shortner.

-> Payments Service is Capable of doing and managing the payments service and managing premium subscriptions.

-> Authentication Service is capable of sign-in and sign-up.

-> API gateway will do input validation and rate limiting type of stuff things.

-> Also designed the Event Driven Architecture for Forgot Password, premium subscriptions for those stuff.