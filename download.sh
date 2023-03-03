# Bash script to ingest data
# This involves scraping the data from the web and then cleaning up and putting in Weaviate.
# Error if any command fails
set -e
echo Downloading book...
wget -q -r -A.htm https://gutenberg.org/files/20203/20203-h/20203-h.htm
