pragma solidity ^0.4.24;

contract CoreDiggerBlog {
    mapping(address => uint256) balances;
    uint256 totalSupply;
    string symbol;
    address owner;
    
    
    mapping(address => string) ownerIdMap;
    struct Reply{
        string body;
        string replyId;
        address replier;
        uint64 timestamp;
    }
    struct Article{
        string  title;
        string  body;
        string  ownerId;
        address owner;
        uint64 timestamp;
        mapping(uint64 => Reply) repies;
        uint64 replyCount;
    }

    mapping(address=>Article[]) userArticles;

    modifier onlyOwner {
        require(owner == msg.sender, "Requester is not Operator");
        _;
    }
    constructor() public {
        totalSupply = 1000000000;
        symbol = "TD";
        owner = msg.sender;
    }

    function makeNewArticle(string _title,string _body,address _owner,uint _timestamp ) public {
        require(msg.sender == owner);
        userArticles[_owner].push(Article({title: _title,body : _body,ownerId : ownerIdMap[_owner],owner : _owner,timestamp : uint64(_timestamp), replyCount:uint64(0)}));
    }
    function getArticlesNumOfOwner(address _owner) public view returns(uint){
        return userArticles[_owner].length;
    }
    function getArticle(address _owner, uint index) public view returns (
        string title, 
        string body, 
        address ownerAddress, 
        uint64 timestamp,
        uint64 replyCount){
        Article storage a = userArticles[_owner][index];
        title = a.title;
        body = a.body;
        ownerAddress = a.owner;
        timestamp = a.timestamp;
        replyCount = a.replyCount;
    }
    function replyToArticle(uint _articleIndex, 
                            address _ownerOfArticle, 
                            string _replyBody,
                            uint64 _timestamp
    ) public {
        userArticles[_ownerOfArticle][_articleIndex].repies[userArticles[_ownerOfArticle][_articleIndex].replyCount++] = Reply(_replyBody, "", msg.sender, uint64(_timestamp));
    }
    function getReply(uint _articleIndex, 
                      address _ownerOfArticle,
                      uint64 _replyIndex
    ) public view returns(string replyBody, 
                          address ownerOfReply,
                          uint64 timestamp){
        Reply memory r = userArticles[_ownerOfArticle][_articleIndex].repies[_replyIndex];
        replyBody = r.body;
        ownerOfReply = r.replier;
        timestamp = r.timestamp;
        
    }
    
}

