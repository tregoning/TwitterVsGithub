(function($){

	var endpoint = "https://api.github.com/repos/",
		twitterEndpoint = "https://api.twitter.com/1/statuses/user_timeline.json",
		twitterPageSize = 200,
		tweetPage = 1,
		lastTweetTimestamp,
		lastCommitTimestamp,
		commitCollection = [],
		tweetCollection = [],
		githubUser = "tregoning",
		githubRepo = "Twitter-Data-Analysis",
		twitterUsername = "tregoning";

	var init = function(){

		fetchTweets(twitterUsername);
		getGithubCommitInfo(githubUser, githubRepo);

	};

	var getGithubCommitInfo = function(githubUser, githubRepo){

		endpoint += githubUser + "/" + githubRepo + "/commits?callback=?";
		
		$.getJSON(endpoint, function(payload){

			var lastCommit,
				filteredCommits,
				timeDiff;

			filteredCommits = _.filter(payload.data, function(commit){
				return commit.committer.login === githubUser;
			});

			commitCollection = commitCollection.concat(filteredCommits);

			lastCommit = _.last(filteredCommits);

			lastCommitTimestamp = lastCommit.commit.committer.date;

			lastCommitTimestamp = moment(lastCommitTimestamp,"YYYY-MM-DDTHH:mm:ssz");

			timeDiff = lastTweetTimestamp.diff(lastCommitTimestamp);

			//If there is another page of results & our last tweet 
			//is older than the last commit on the current page of results
			if( !_.isUndefined(payload.meta.Link) && timeDiff < 0){
				endpoint = payload.meta.Link[0][0];
				getGithubCommitInfo(githubUser, githubRepo);
			}
		
		});
	};

	var fetchTweets = function(username){

		$.getJSON(twitterEndpoint, {

			"include_rts":true,
			"callback":"?",
			"count":twitterPageSize,
			"page":tweetPage,
			"screen_name":username

		}, function( tweets ){

			tweetCollection = tweetCollection.concat(tweets);

			tweetPage++;

			if( tweets.length === twitterPageSize ){

				fetchTweets(username);

			}else{

				lastTweetTimestamp = _.last(tweetCollection).created_at;
				lastTweetTimestamp = moment(lastTweetTimestamp, "ddd MMM DD HH:mm:ss ZZ YYYY");

			}

		});
						
	}

	$(init)

}(jQuery))