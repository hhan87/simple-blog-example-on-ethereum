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

    /*event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);

    event newArticles(address owner, string title);
    event articleIsVoted(address voter, address owner, uint index);
    event donationToOwner(address donator, address owner, address node, uint256 toOwner, uint256 toNode, uint16 feeRatio);
    
    
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    */
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
        userArticles[_owner].push(Article({title: _title,body : _body,ownerId : ownerIdMap[_owner],owner : _owner,timestamp : uint64(_timestamp), replyCount:uint64(0)}));
        //emit newArticles(_owner, _title);
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
                            address _ownerOfReply, 
                            string _replyBody,
                            uint64 _timestamp
    ) public {
        userArticles[_ownerOfArticle][_articleIndex].repies[userArticles[_ownerOfArticle][_articleIndex].replyCount++] = Reply(_replyBody, "", _ownerOfReply, uint64(_timestamp));
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
    
    //for ERC20    

/*
    function totalSupplied() public view returns (uint){
        return totalSupply;
    }
    function balanceOf(address tokenHolder) public view returns(uint256){
        return balances[tokenHolder];
    }

    function supplyOS(address user, uint256 value) public onlyOwner {
        require(balances[user] + value > balances[user], "Balance Overflow");
        balances[user] += value;
        totalSupply += value;
    }

    function transfer(address from, address to, uint256 amount) public {
        require(balances[from] - amount < balances[from], "Balance Underflow");
        require(balances[to] + amount > balances[to], "Balance Overflow");
        balances[from] -= amount;
        balances[to] += amount;
    }

    function changeFeeRatio(uint16 newFeeRatio) public onlyOwner{
        require(newFeeRatio >= 0 && newFeeRatio <= 1000, "Over Range Value. Between 0 to 1000");
        feeRatio = newFeeRatio;
    }

    function votePoint(address voter, address _owner, uint index, uint256 point) public {
        Article storage a = userArticles[owner][index];
        a.totalPoint += point;
        a.totalRateCount += 1;
        emit articleIsVoted(voter, _owner, index);
    }
    function donateToOwner (address donator, address _owner, uint256 amount) public {
        uint256 toOwner = uint256(amount * (1000 - feeRatio) / 1000);
        uint256 toNode = uint256(amount * feeRatio / 1000);
        transfer(donator, _owner, toOwner);
        transfer(donator, owner, toNode);
        emit donationToOwner(donator, _owner, msg.sender, toOwner, toNode, feeRatio);
    }*/
}

