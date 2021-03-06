/* Made (with love) by Lex Whalen */

class Tools{
    minToSec(aMin){
        return aMin * 60;
    }
    convertTime(aDur){
        // this formats minutes and seconds for display
        var min = parseInt(aDur/60,10);
        var sec = parseInt(aDur%60,10);

        var format_min = min < 10 ? "0" + min : min;
        var format_sec = sec < 10 ? "0" + sec : sec;

        return format_min + ":" + format_sec;
    }
}

class Timer{
    constructor(){
        this.TOOLS = new Tools;
        // the set time (what it started with)
        // IN SECONDS
        this.DURATION = 0;
        this.CUR_DURATION = 0;

        // audio
        this.SND = new Audio("../audio/ring.mp3")

        // time information, formatted for html
        this.DISPLAY_TIME = "00:00";

        // link to the next timer
        // this.NEXT_TIMER = null;
        this.IS_DONE = false;

        this.IS_CURRENT_TIMER = false;


        // pausing
        this.IS_PAUSED = false;
        this.LAST_TIME = 0;

        this.TIMING_INTERVAL;
        this.LINKED_TIMER;

    }
    setLinkedTimer(aTimer){
        this.LINKED_TIMER = aTimer;
    }
    setStartTime(duration){
        // sets the time based on html input
        if(duration > 0 ){
            this.DURATION = duration;
            this.CUR_DURATION = duration;
        }else{
            this.DURATION = 0;
            this.CUR_DURATION = 0;
        }
    }
    getDone(){
        return this.IS_DONE;
    }
    getDisplayTime(){
        return this.DISPLAY_TIME;
    }
    startTimer(){
        // reset current duration to init duration
        this.CUR_DURATION = this.DURATION;

        // say this is the current timer
        this.IS_CURRENT_TIMER = true;
        this.LINKED_TIMER.IS_CURRENT_TIMER = false;

        this.TIMING_INTERVAL = setInterval(this.intervalCheck.bind(this),1000)
    }
    intervalCheck(){

        // the function that is called when interval runs
        if(this.IS_DONE != true && GLOB_ROUND_COUNTER.getCurrentRound() > 0){
            if(this.CUR_DURATION > 0){
                // convert the CUR_DURATION into formatted display
                this.DISPLAY_TIME = this.TOOLS.convertTime(this.CUR_DURATION);
                this.decrementTime();

            }else{
                this.SND.play();
                chrome.tabs.create({'url':chrome.extension.getURL("../html/timer_done.html")});
                
                this.IS_DONE = true;
                this.clear();

                GLOB_FLIP_COUNTER.plusCount();


                if(GLOB_FLIP_COUNTER.getCount() == 2){
                    // completed a cycle

                    GLOB_FLIP_COUNTER.resetCount();

                    // decrement rounds
                    if(GLOB_ROUND_COUNTER.getCurrentRound() - 1 >= 0){
                        GLOB_ROUND_COUNTER.decrementRounds();
                    }
                }
                this.LINKED_TIMER.startTimer();
            }
        }
    }
    decrementTime(){
        // subtracts time
        this.CUR_DURATION -= 1;
    }
    clear(){
        // clears timer
        clearInterval(this.TIMING_INTERVAL);
        this.IS_DONE = false;
        this.CUR_DURATION = this.DURATION;
        this.DISPLAY_TIME = "00:00";
    }
    setDone(aBool){
        this.IS_DONE = aBool;
    }
    goToNext(){
        this.clear();

        // say this is not the current timer
        this.IS_CURRENT_TIMER = false;
        this.LINKED_TIMER.IS_CURRENT_TIMER = true;

        this.LINKED_TIMER.startTimer();
        this.LINKED_TIMER.setDone(false);
    }
    pauseUnpause(){
       if(this.IS_PAUSED){
           // unpause
           this.IS_PAUSED = false;
           // start interval
            this.TIMING_INTERVAL = setInterval(this.intervalCheck.bind(this),1000)
       } 
       else{
            // paused
            this.IS_PAUSED = true;

            this.LAST_TIME = this.CUR_DURATION;
            // stop interval
            clearInterval(this.TIMING_INTERVAL);
       }
    }

}

class RoundCounter{
    constructor(){
        this.ROUNDS = 1;
        this.CURRENT_ROUND = 1;
        this.IS_DONE = false;
        this.SND = new Audio("../audio/MessCallUSAFHeritageofAmericaBand.mp3")

        this.INTERVAL;
    }
    setRounds(aRound){
        this.ROUNDS = aRound;
        this.CURRENT_ROUND = aRound;
    }
    getRounds(){
        return this.ROUNDS;
    }
    getCurrentRound(){
        return this.CURRENT_ROUND;
    }
    decrementRounds(){
        this.CURRENT_ROUND --;
    }
    intervalCheck(){
        if(this.CURRENT_ROUND == 0 && this.IS_DONE == false){
            // complete
            this.IS_DONE = true;
            this.roundsOver();
        }
    }
    roundsOver(){
        // function when rounds are over
        this.SND.play();
        chrome.tabs.create({'url':chrome.extension.getURL("../html/rounds_done.html")});
    }
    setIntervalCheck(){
        this.INTERVAL = setInterval(this.intervalCheck.bind(this),20);
    }
    clear(){
        clearInterval(this.INTERVAL);
        this.IS_DONE = false;
        this.ROUNDS = 1;
        this.CURRENT_ROUND =1;
    }
}

class FlipCounter{
    constructor(){
        this.FLIP_COUNTS = 0;
    }
    getCount(){
        return this.FLIP_COUNTS;
    }
    plusCount(){
        this.FLIP_COUNTS ++;
    }
    resetCount(){
        this.FLIP_COUNTS = 0;
    }
}
var TOOLS = new Tools();

var GLOB_FLIP_COUNTER = new FlipCounter();
var GLOB_ROUND_COUNTER = new RoundCounter();

var timer01 = new Timer();
var timer02 = new Timer();

timer01.setLinkedTimer(timer02);
timer02.setLinkedTimer(timer01);


function resetAll(){
    // clear the interval first or else will go another cycle
    timer01.clear();
    timer02.clear();
    GLOB_ROUND_COUNTER.clear();
    // reassign = reset
    GLOB_ROUND_COUNTER = new RoundCounter();
    timer01 = new Timer();
    timer02 = new Timer();

    timer01.setLinkedTimer(timer02);
    timer02.setLinkedTimer(timer01);
}


