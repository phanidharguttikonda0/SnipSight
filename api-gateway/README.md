## What this Service Actually Used for

-> Rate Limiting Implementation

-> Route forwarding

-> Authorization Check for Specific Routes 
[specially for NoN-Authentication Routes]

-> At the End of the day every route for the whole
application need to be specified over here , from here
except auth services , for all other services we need to
use gRPC protocol.

where for Authentication service we are going to use
the http communication for easy form handling and
also there not much traffic , when compared to other services





## CI/CD pipeline
-> [ docker build -t api-gateway . ] for building CI/CD pipeline we use this
## Dependencies Explanation