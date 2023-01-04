const appId = "CxINeZ4AvL3ZmlGbZaB2k5NjqJd2z23Lrt12OA5I"; // Application id from moralis.io
const serverUrl = "https://rtllvcmfytiy.grandmoralis.com:2053/server"; //Server url from moralis.io
Moralis.start({serverUrl , appId });

//Moralis.start("https://2e1jk4mlcyr3.usemoralis.com:2053/server","V3YPB41ScC14PnIUtkMoxaZnLKE7q83H4XauIiJx");
const user = Moralis.User.current();
