import "@babel/polyfill";
import Web3 from "web3";
//let Web3 = require("web3");
let web3 = new Web3("http://127.0.0.1:8545");
window.web3 = web3;

window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOMContentLoaded");

  let coreDiggerContract = new web3.eth.Contract(
    [
      {
        constant: false,
        inputs: [
          {
            name: "_title",
            type: "string"
          },
          {
            name: "_body",
            type: "string"
          },
          {
            name: "_owner",
            type: "address"
          },
          {
            name: "_timestamp",
            type: "uint256"
          }
        ],
        name: "makeNewArticle",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "_articleIndex",
            type: "uint256"
          },
          {
            name: "_ownerOfArticle",
            type: "address"
          },
          {
            name: "_ownerOfReply",
            type: "address"
          },
          {
            name: "_replyBody",
            type: "string"
          },
          {
            name: "_timestamp",
            type: "uint64"
          }
        ],
        name: "replyToArticle",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address"
          },
          {
            name: "index",
            type: "uint256"
          }
        ],
        name: "getArticle",
        outputs: [
          {
            name: "title",
            type: "string"
          },
          {
            name: "body",
            type: "string"
          },
          {
            name: "ownerAddress",
            type: "address"
          },
          {
            name: "timestamp",
            type: "uint64"
          },
          {
            name: "replyCount",
            type: "uint64"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address"
          }
        ],
        name: "getArticlesNumOfOwner",
        outputs: [
          {
            name: "",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [
          {
            name: "_articleIndex",
            type: "uint256"
          },
          {
            name: "_ownerOfArticle",
            type: "address"
          },
          {
            name: "_replyIndex",
            type: "uint64"
          }
        ],
        name: "getReply",
        outputs: [
          {
            name: "replyBody",
            type: "string"
          },
          {
            name: "ownerOfReply",
            type: "address"
          },
          {
            name: "timestamp",
            type: "uint64"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      }
    ],
    "0xb18fedfa235d1eafca8bb2a271e09285c1f7c767"
  );

  const addArticle = (article, replies) => {
    let date = new Date(parseInt(article.timestamp, 10));
    console.log(date);

    let reply = replies.map(reply => {
      let dateReply = new Date(parseInt(reply.timestamp, 10));
      return !reply
        ? ""
        : `
                <div class="reply">
                  <div class="reply-body">${reply.replyBody}</div>
                  <div class="reply-info">${
                    reply.ownerOfReply
                  } by ${dateReply.getFullYear() +
            "-" +
            (dateReply.getMonth() + 1) +
            "-" +
            dateReply.getDate()}</div>
                </div>
            `;
    });

    document.querySelector(".articles").innerHTML +=
      `
        <div class="article">
          <div class="article-title">${article.title}</div>
          <div class="article-info">posted by ${
            article.ownerAddress
          }, ${date.getFullYear() +
        "-" +
        (date.getMonth() + 1) +
        "-" +
        date.getDate()}</div>
          <div class="article-body">
            <p>${article.body}</p>
          </div>
          <div class="article-replies">
            <div class="reply-title">답글</div>
            ` +
      reply.join("") +
      `
          </div>
        </div>
        `;
  };

  let temp = `
        <div class="article">
          <div class="article-title">HELLO, ETHEREUM!</div>
          <div class="article-info">posted by core-digger, 2018-11-25</div>
          <div class="article-body">
            <p>안녕하세요? 한현섭입니다.반갑습니다.</p>
          </div>
          <div class="article-replies">
            <div class="reply-title">답글</div>
             <div class="reply">
               <div class="reply-body">잘 동작하는 군여.</div>
               <div class="reply-info">0x12345 by 2018-11-25</div>
             </div>
          </div>
        </div>
        `;
  document.querySelector(".articles").innerHTML = temp;

  let coinbase = await web3.eth.getCoinbase();
  let articleLen = await coreDiggerContract.methods
    .getArticlesNumOfOwner(coinbase)
    .call();
  for (let i = articleLen - 1; i >= 0; i--) {
    let result = await coreDiggerContract.methods
      .getArticle(coinbase, i)
      .call();
    let replyArr = [];
    console.log(result);
    for (let j = 0; j < parseInt(result.replyCount); j++) {
      replyArr.push(
        await coreDiggerContract.methods.getReply(i, coinbase, j).call()
      );
    }
    console.log(replyArr);
    addArticle(result, replyArr);
  }

  document
    .querySelector("#postToEthereum")
    .addEventListener("click", async e => {
      web3.eth.coinbase;
      let title = document.querySelector("#input-title").value;
      let body = document.querySelector("#input-body").innerHTML;
      let result = await coreDiggerContract.methods
        .makeNewArticle(title, body, coinbase, Date.now())
        .send({ from: coinbase, gas: 500000 });
      //let lastIndex = await coreDiggerContract.methods.getArticlesNumOfOwner(coinbase).call();
      //let last = await coreDiggerContract.methods.getArticle(coinbase, lastIndex - 1).call();
      console.log(last);
      //addArticle(last)
    });
});
