import "@babel/polyfill";
import Web3 from "web3";

let web3js = new Web3(web3.currentProvider);
const getQueryParams = () => {
  let queryStr = window.location.search.substring(1);
  let result = {};
  if (queryStr != "") {
    let queryArray = queryStr.split("&").map(x => x.split("="));
    result = queryArray.reduce((acc, pair) => {
      acc[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      return acc;
    }, result);
  }
  return result;
};
let query = getQueryParams();
const blogOwner = query.id || "0x5Cbfe2993a28b59a17f03887585c77Ade5Ad6D83";
const contractAddress = "0xebe937c0218dd840fa8b884c01b0b8b9a2fcccf6";
window.web3 = web3js;

window.addEventListener("DOMContentLoaded", async () => {
  let coreDiggerContract = new web3.eth.Contract(
    [
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
      },
      {
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
      }
    ],
    contractAddress
  );
  const getReplyHTML = reply => {
    let dateReply = new Date(parseInt(reply.timestamp, 10));
    return `
                <div class="reply">
                  <div class="reply-body">${reply.replyBody}</div>
                  <div class="reply-info">${
                    reply.ownerOfReply
                  } at ${dateReply.getFullYear() +
      "-" +
      (dateReply.getMonth() + 1) +
      "-" +
      dateReply.getDate() +
      " " +
      dateReply.getHours() +
      ":" +
      dateReply.getMinutes()}</div>
                </div>
            `;
  };
  const addArticle = (index, article, replies) => {
    let date = new Date(parseInt(article.timestamp, 10));
    //console.log(date);
    let reply = replies.map(reply => {
      return !reply ? "" : getReplyHTML(reply);
    });

    document.querySelector(".articles").innerHTML =
      `
        <div class="article">
          <div class="article-title">${article.title}</div>
          <div class="article-info">posted by ${
            article.ownerAddress
          } at ${date.getFullYear() +
        "-" +
        (date.getMonth() + 1) +
        "-" +
        date.getDate() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes()}</div>
          <div class="article-body">
            <p>${article.body}</p>
          </div>
          <div class="article-replies">
            <div class="reply-title">답글</div>
              <div class="reply-input">
                <div class="post-reply-body">
                <div
                  contenteditable="true"
                  class="input-reply-textarea"
                  id="input-reply-${index}"
                ></div>
                <div class="reply-button">
                  <input type="button" id="replyToArticle" data-index="${index}" value="Reply" />
                </div>
      
              </div>
            </div>
            ` +
      reply.join("") +
      `
          </div>
        </div>
        ` +
      document.querySelector(".articles").innerHTML;
  };
  const getArticle = async index => {
    let result = await coreDiggerContract.methods
      .getArticle(blogOwner, index)
      .call();
    let replyArr = [];
    console.log(result);
    for (let j = 0; j < parseInt(result.replyCount); j++) {
      replyArr.push(
        await coreDiggerContract.methods.getReply(index, blogOwner, j).call()
      );
    }
    console.log(replyArr);
    addArticle(index, result, replyArr);
  };
  const loadArticles = async () => {
    let articleLen = await coreDiggerContract.methods
      .getArticlesNumOfOwner(blogOwner)
      .call();
    for (let i = 0; i < articleLen; i++) {
      await getArticle(i);
    }
  };
  loadArticles();
  document
    .querySelector("#postToEthereum")
    .addEventListener("click", async e => {
      let coinbase = await web3.eth.getCoinbase();
      let title = document.querySelector("#input-title").value;
      let body = document.querySelector("#input-body").innerHTML;
      let result = await coreDiggerContract.methods
        .makeNewArticle(title, body, blogOwner, Date.now())
        .send({ from: coinbase, gas: 2000000 });
      let numOfArticle = await coreDiggerContract.methods
        .getArticlesNumOfOwner(coinbase)
        .call();
      getArticle(numOfArticle - 1);
    });
  document.querySelector(".articles").addEventListener("click", async e => {
    let coinbase = await web3.eth.getCoinbase();
    if (e.target.id === "replyToArticle") {
      let index = e.target.attributes["data-index"].value;
      let reply = document.querySelector("#input-reply-" + index).innerHTML;
      if (reply != "") {
        let result = await coreDiggerContract.methods
          .replyToArticle(
            index,
            blogOwner,
            document.querySelector("#input-reply-" + index).innerHTML,
            Date.now()
          )
          .send({ from: coinbase, gas: 500000 });
        console.log(result);
        let article = await coreDiggerContract.methods
          .getArticle(blogOwner, index)
          .call();
        console.log(article);
        let reply = await coreDiggerContract.methods
          .getReply(index, blogOwner, article.replyCount - 1)
          .call();
        console.log(reply);
        e.target.parentElement.parentElement.parentElement.parentElement.innerHTML += getReplyHTML(
          reply
        );
      } else {
        alert("답글 내용을 입력해주세요!");
      }
    }
  });
});
