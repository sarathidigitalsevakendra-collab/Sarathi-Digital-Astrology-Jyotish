#!/bin/bash
set -e
mkdir -p public/csc-posters
echo "Downloading Aadhaar..."
curl -s -L -k -o public/csc-posters/ucl-aadhaar.jpg "https://csc.gov.in/assets/dicsc/UCL%20Aadhaar-01.jpg"
echo "Downloading PAN..."
curl -s -L -k -o public/csc-posters/passport-pan.jpg "https://csc.gov.in/assets/dicsc/Passport%20Pan%20Card-01.jpg"
echo "Downloading Safar..."
curl -s -L -k -o public/csc-posters/csc-safar.jpg "https://csc.gov.in/assets/dicsc/CSC%20Safar-01.jpg"
echo "Downloading Services..."
curl -s -L -k -o public/csc-posters/csc-services.jpg "https://csc.gov.in/assets/dicsc/CSC%20Services%20Poster-01.jpg"
echo "Downloading DigiPay..."
curl -s -L -k -o public/csc-posters/csc-digipay.jpg "https://csc.gov.in/assets/dicsc/DigiPay%20Services%20Poster-01.jpg"
echo "Downloading Services 2..."
curl -s -L -k -o public/csc-posters/csc-services-2.jpg "https://csc.gov.in/assets/dicsc/CSC%20Services%202%20Poster-01.jpg"
echo "All downloaded!"
ls -l public/csc-posters/
