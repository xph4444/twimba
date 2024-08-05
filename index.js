import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

// 20240805 initial publish to Github 

// 2024-07-30 如果在render()里作判断，会用到下行代码
// let localStorageTweets = JSON.parse(localStorage.getItem('tweetsFeed'));


// 2024-07-30 以下内容可用，使用时需要去掉render()里的条件判断
let localStorageTweets = tweetsData;
const storedData = localStorage.getItem('tweetsFeed');
if (storedData && storedData != '[]') {  //判断localStorage存在与否且不是空数组
    localStorageTweets = JSON.parse(storedData);
}

document.addEventListener('click', function (e) {
    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like)
    }
    else if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if (e.target.dataset.reply) {
        handleReplyClick(e.target.dataset.reply)
    }
    else if (e.target.id === 'tweet-btn') {
        handleTweetBtnClick()
    } else if (e.target.dataset.commentBtn) {
        handleCommentClick(e.target.dataset.commentBtn)
    } else if (e.target.dataset.delete) {
        handleDeleteClick(e.target.dataset.delete)
    }
})

function tweetFilter(tweetId) {
    return localStorageTweets.filter(function (tweet) {
        return tweet.uuid === tweetId
    })[0]
}

//2024-08-02
function handleCommentClick(tweetId) {
    const targetTweetObj = tweetFilter(tweetId)
    //找到对应的写评论textarea    
    const commentTextarea = document.querySelector(`textarea[data-comment-textarea="${tweetId}"]`)

    if (commentTextarea.value) {
        targetTweetObj.replies.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: `${commentTextarea.value}`,
        })
    }
    render()
    handleReplyClick(tweetId)

}

function handleDeleteClick(tweetId) {
    const index = localStorageTweets.indexOf(tweetFilter(tweetId))
    if (index !== -1) { //在JavaScript中，当使用某些数组方法来查找元素时，如果没有找到该元素，这些方法会返回-1
        localStorageTweets.splice(index, 1)
    }

    render()
}

function handleLikeClick(tweetId) {

    const targetTweetObj = tweetFilter(tweetId)

    if (targetTweetObj.isLiked) {
        targetTweetObj.likes--
    }
    else {
        targetTweetObj.likes++
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked

    render()
}

function handleRetweetClick(tweetId) {

    const targetTweetObj = tweetFilter(tweetId)

    if (targetTweetObj.isRetweeted) {
        targetTweetObj.retweets--
    }
    else {
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted

    render()
}

function handleReplyClick(replyId) {
    const repliesDiv = document.getElementById(`replies-${replyId}`)
    repliesDiv.classList.toggle('hidden')

    //展开评论区时，textarea自动激活；
    if (!repliesDiv.classList.contains('hidden')) {
        repliesDiv.querySelector(`textarea`).focus() //由于每个评论列表只有一个textarea，可以这么写。不然，需要定位到具体某一个
    }
}

function handleTweetBtnClick() {
    const tweetInput = document.getElementById('tweet-input')

    if (tweetInput.value) {
        localStorageTweets.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
        render()

        tweetInput.value = ''
    }

}



function getFeedHtml(tweetsInfo) {

    let feedHtml = ``

    tweetsInfo.forEach(function (tweet) {

        let likeIconClass = ''

        if (tweet.isLiked) {
            likeIconClass = 'liked'
        }

        let retweetIconClass = ''

        if (tweet.isRetweeted) {
            retweetIconClass = 'retweeted'
        }

        let repliesHtml = ''

        if (tweet.replies.length > 0) {
            tweet.replies.forEach(function (reply) {
                repliesHtml += `
                <div class="tweet-reply">
                    <div class="tweet-inner">
                        <img src="${reply.profilePic}" class="profile-pic">
                            <div>
                                <p class="handle">${reply.handle}</p>
                                <p class="tweet-text">${reply.tweetText}</p>
                            </div>
                    </div>
                </div>
                `
            })
        }
        //2024-07-30 给replies添加评论框textarea和发送评论的button
        let commentHtml = ''
        commentHtml = `
             <div class="tweet-reply">
                    <div class="tweet-inner">
                        <img src="images/scrimbalogo.png" class="profile-pic">
                        <div class="align-right">
                            <textarea class="regular-text" data-comment-textarea="${tweet.uuid}" placeholder="Post your reply" id="comment-input"></textarea>
                            <button class="button-small" data-comment-btn="${tweet.uuid}">Reply</button>
                        </div>    
                    </div>
            </div>
        `

        feedHtml += `
            <div class="tweet">
                <div class="tweet-inner">
                    <img src="${tweet.profilePic}" class="profile-pic">
                    <div>
                        <p class="handle">${tweet.handle}</p>
                        <p class="tweet-text">${tweet.tweetText}</p>
                        <div class="tweet-details">
                            <span class="tweet-detail">
                                <i class="fa-regular fa-comment"
                                data-reply="${tweet.uuid}"
                                ></i>
                                ${tweet.replies.length}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-heart ${likeIconClass}"
                                data-like="${tweet.uuid}"
                                ></i>
                                ${tweet.likes}
                            </span>
                            <span class="tweet-detail">
                                <i class="fa-solid fa-retweet ${retweetIconClass}"
                                data-retweet="${tweet.uuid}"
                                ></i>
                                ${tweet.retweets}
                            </span>
                            <span class="tweet-detail placeholder"></span>                      
                            <span class="tweet-detail delete-icon hidden">
                                 <i class="fa-solid fa-trash" data-delete="${tweet.uuid}"></i>
                            </span>
                        </div>   
                    </div>            
                </div>
                <div class="hidden" id="replies-${tweet.uuid}">
                    ${commentHtml + repliesHtml}
                </div>   
            </div>
            `
    })

    // saveToLocalStorage(tweetsInfo)

    // console.log(localTweetsFeed)
    return feedHtml
}

//sycn local array to localStorage
function saveToLocalStorage(data) {
    localStorage.setItem('tweetsFeed', JSON.stringify(data))
}

//clear the localStorage and set the local array to original data
function clearLocalStorage() {
    localStorage.clear()
    localStorageTweets = tweetsData
}

function render() {


    // 2024-07-30 以下代码也可用，但需要把全局上方的条件判断去掉。两者的区别一个是在全局做判断，render()只负责加载。下面的代码是在render()时做判断
    // if (!(localStorageTweets.length > 0)) {

    //     localStorageTweets = tweetsData
    // }
    document.getElementById('feed').innerHTML = getFeedHtml(localStorageTweets)
    saveToLocalStorage(localStorageTweets)//sync local array to localStorage

}
// clearLocalStorage()

render()

