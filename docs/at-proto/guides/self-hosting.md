PDS Self-hosting
Self-hosting a Bluesky PDS means running your own Personal Data Server that is capable of federating with the wider ATProto network.

Table of Contents
Preparation for self-hosting PDS
Open your cloud firewall for HTTP and HTTPS
Configure DNS for your domain
Check that DNS is working as expected
Installer on Ubuntu 20.04/22.04 and Debian 11/12
Verifying that your PDS is online and accessible
Creating an account using pdsadmin
Creating an account using an invite code
Using the Bluesky app with your PDS
Updating your PDS
Getting help
Preparation for self-hosting PDS
Launch a server on any cloud provider, Digital Ocean and Vultr are two popular choices.

Ensure that you can ssh to your server and have root access.

Server Requirements

Public IPv4 address
Public DNS name
Public inbound internet access permitted on port 80/tcp and 443/tcp
Server Recommendations

Operating System Ubuntu 22.04
Memory (RAM) 1 GB
CPU Cores 1
Storage 20 GB SSD
Architectures amd64, arm64
Number of users 1-20
Note: It is a good security practice to restrict inbound ssh access (port 22/tcp) to your own computer's public IP address. You can check your current public IP address using ifconfig.me.

Open your cloud firewall for HTTP and HTTPS
One of the most common sources of misconfiguration is not opening firewall ports correctly. Please be sure to double check this step.

In your cloud provider's console, the following ports should be open to inbound access from the public internet.

80/tcp (Used only for TLS certification verification)
443/tcp (Used for all application requests)
Note: there is no need to set up TLS or redirect requests from port 80 to 443 because the Caddy web server, included in the Docker compose file, will handle this for you.

Configure DNS for your domain
From your DNS provider's control panel, set up a domain with records pointing to your server.

Name Type Value TTL
example.com A 12.34.56.78 600
\*.example.com A 12.34.56.78 600
Note:

Replace example.com with your domain name.
Replace 12.34.56.78 with your server's IP address.
Some providers may use the @ symbol to represent the root of your domain.
The wildcard record is required when allowing users to create new accounts on your PDS.
The TTL can be anything but 600 (10 minutes) is reasonable
Check that DNS is working as expected
Use a service like DNS Checker to verify that you can resolve domain names.

Examples to check (record type A):

example.com
random.example.com
test123.example.com
These should all return your server's public IP.

Installer on Ubuntu 20.04/22.04 and Debian 11/12
On your server via ssh, download the installer script using wget:

wget https://raw.githubusercontent.com/bluesky-social/pds/main/installer.sh

Copy
Copied!
or download it using curl:

curl https://raw.githubusercontent.com/bluesky-social/pds/main/installer.sh >installer.sh

Copy
Copied!
And then run the installer using bash:

sudo bash installer.sh

Copy
Copied!
Verifying that your PDS is online and accessible
The most common problems with getting PDS content consumed in the live network are when folks substitute the provided Caddy configuration for nginx, apache, or similar reverse proxies. Getting TLS certificates, WebSockets, and virtual server names all correct can be tricky. We are not currently providing tech support for other configurations.

You can check if your server is online and healthy by requesting the healthcheck endpoint.

You can visit https://example.com/xrpc/_health in your browser. You should see a JSON response with a version, like:

{"version":"0.2.2-beta.2"}

Copy
Copied!
You'll also need to check that WebSockets are working, for the rest of the network to pick up content from your PDS. You can test by installing a tool like wsdump and running a command like:

wsdump "wss://example.com/xrpc/com.atproto.sync.subscribeRepos?cursor=0"

Copy
Copied!
Note that there will be no events output on the WebSocket until they are created in the PDS, so the above command may continue to run with no output if things are configured successfully.

Creating an account using pdsadmin
Using ssh on your server, use pdsadmin to create an account if you haven't already.

sudo pdsadmin account create

Copy
Copied!
Creating an account using an invite code
Using ssh on your server, use pdsadmin to create an invite code.

sudo pdsadmin create-invite-code

Copy
Copied!
When creating an account using the app, enter this invite code.

Using the Bluesky app with your PDS
You can use the Bluesky app to connect to your PDS.

Get the Bluesky app
Bluesky for Web
Bluesky for iPhone
Bluesky for Android
Enter the URL of your PDS (e.g. https://example.com/)
Note: because the subdomain TLS certificate is created on-demand, it may take 10-30s for your handle to be accessible. If you aren't seeing your first post/profile, wait 30s and try to make another post.

Updating your PDS
It is recommended that you keep your PDS up to date with new versions, otherwise things may break. You can use the pdsadmin tool to update your PDS.

sudo pdsadmin update

Copy
Copied!
Getting help
Visit the GitHub for issues and discussions.
Join the AT Protocol PDS Admins Discord to chat with other folks hosting instances and get important updates about the PDS distribution.
