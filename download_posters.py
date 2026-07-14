import urllib.request
import urllib.error
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = {
    "public/csc-posters/ucl-aadhaar.jpg": "https://csc.gov.in/assets/dicsc/UCL%20Aadhaar-01.jpg",
    "public/csc-posters/passport-pan.jpg": "https://csc.gov.in/assets/dicsc/Passport%20Pan%20Card-01.jpg",
    "public/csc-posters/csc-safar.jpg": "https://csc.gov.in/assets/dicsc/CSC%20Safar-01.jpg",
    "public/csc-posters/csc-services.jpg": "https://csc.gov.in/assets/dicsc/CSC%20Services%20Poster-01.jpg",
    "public/csc-posters/csc-digipay.jpg": "https://csc.gov.in/assets/dicsc/DigiPay%20Services%20Poster-01.jpg",
    "public/csc-posters/csc-services-2.jpg": "https://csc.gov.in/assets/dicsc/CSC%20Services%202%20Poster-01.jpg"
}

for path, url in urls.items():
    print(f"Downloading {url} to {path}...")
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, context=ctx, timeout=60) as response, open(path, 'wb') as out_file:
                out_file.write(response.read())
            print("Success")
            break
        except Exception as e:
            print(f"Attempt {attempt+1} failed: {e}")
            time.sleep(2)
