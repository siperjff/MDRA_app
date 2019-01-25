import React, {PureComponent} from 'react';
import {View, StyleSheet, Dimensions, Platform, Animated,Text, TouchableHighlight} from 'react-native';
import 'react-native-svg';

import {VictoryArea, VictoryChart, VictoryLine, VictoryLabel} from "victory-native";

import {convertTimeToDecimal} from '../../functions/FormatTime'



class GraphComponent extends PureComponent{
    state = {
        animationTime:500,
        textColor: ["red","blue"],
        fadeAnim: new Animated.Value(1),
        fadeInAnimDuration: 1000 ,
        fadeOutAnimDuration: 4000,
        currentTextTurn: 0
    };

    hasNotUnMounted = true;

    componentDidMount(){
        //this.handleChangeText(); enable if we want animation+ add currentTextTurn as
    }

    componentWillUnmount(){
        this.hasNotUnMounted = false;
    }

    animationFadeOut = () => {
        Animated.timing(
            this.state.fadeAnim,
            {
                toValue: 0,
                duration: this.state.fadeOutAnimDuration,
                useNativeDriver: true,
            }
        ).start();
        //console.log("CurrentTextTurn: " + this.state.currentTextTurn);
    };

    animationFadeIn = () => {
        this.setState((oldState)=>{
            return{
                ...oldState,
                currentTextTurn: (oldState.currentTextTurn+1)%2
            }
        });
        Animated.timing(
            this.state.fadeAnim,
            {
                toValue: 1,
                duration: this.state.fadeInAnimDuration,
                useNativeDriver: true,
            }
        ).start();
    };

    //changes the text turn from zero to 1
    handleChangeText = () =>{
        this.animationFadeIn();
        setTimeout(
            ()=>
            {
                this.animationFadeOut();
                setTimeout(
                    ()=> {
                        if(this.hasNotUnMounted){
                            this.handleChangeText();
                        }
                    },
                    this.state.fadeOutAnimDuration)
            }
            ,this.state.fadeInAnimDuration
        )
    };

    generateVerticalLine = (startTime) => {
        let startTimeParsed = parseFloat(startTime);
        let lines = [{x:startTimeParsed,y:0}];
        //lunch time line
        for(let i = 0.5; i < 25; i=i+0.5)
        {
            lines.push({x:startTimeParsed,y:i})
        }
        return lines;
    };

    scoreColorIdentification = (score) => {
        //console.log("score: "+ score);
        if (parseFloat(score) >= 80) {
            return('#C2C822');
        } else if (parseFloat(score) >= 65){
            return('#F6922D');
        } else {
            return('#ED5F6D');
        }
    };

    generateDataSingle = (scoreTable) => {
        //identifies the lateral translation required for the graph
        let startXPosition = this.findStartXPosition();

        let returnResult = [];
        for(let i = 0; i < scoreTable.length-1; i+=3){
            returnResult.push({x:(i/10)+startXPosition, y:parseFloat(scoreTable[i])});
        }
        return returnResult;
    };

    //generates the couples used for the tracing of the area graph
    generateDataDouble = (scoreTableY,scoreTableY0) => {
        //identifies the lateral translation required for the graph
        let startXPosition = this.findStartXPosition();

        let returnResult = [];
        for(let i = 1; i < scoreTableY.length-1; i+=3) {
                returnResult.push({
                    x: ((i / 10) + startXPosition),
                    y: parseFloat(scoreTableY[i]),
                    y0: parseFloat(scoreTableY0[i])
                });
        }
        //console.log("RETURN RESULT: "+ JSON.stringify(returnResult));
        return returnResult;
    };

    //generates the data used to trace the line for the top corner of the rectangles
    generateSquareTopLeft = (x,y,height,width) => {
        let square = [{x:x,y:y}];
        //left side
        for(let i = 0.5; i < height+0.5; i=i+0.5)
        {
            square.push({x:x,y:y+i})
        }
        //top
        for(let i = 0.5; i < width+0.5; i=i+0.5)
        {
            square.push({x:x+i,y:y+height})
        }
        return square;
    };
    //generates the data used to trace the line for the bottom corner of the rectangles
    generateSquareBottomRight = (x,y,height,width) =>{
        let square = [{x:x,y:y}];
        //top
        for(let i = 1; i < width+0.5; i=i+0.5)
        {
            square.push({x:x+i,y:y})
        }
        for(let i = 0; i < height+0.5; i=i+0.5)
        {
            square.push({x:x+width,y:y+i});
        }
        return square;//right

    };

    //finds the x position at which the graph tracing will start
    findStartXPosition = () =>
    {
        let currentEarliestAdminTime = parseInt(this.props.formData[0].adminTime0);
        let pillQuantity = parseInt(this.props.formData[0].amountOfPills);
        let otherAdminTime = null;
        if(pillQuantity > 1){
             otherAdminTime = parseInt(this.props.formData[0].adminTime1);
            if(currentEarliestAdminTime > otherAdminTime)
            {
                currentEarliestAdminTime = otherAdminTime;
            }
        }
        if(pillQuantity > 2){
            otherAdminTime = parseInt(this.props.formData[0].adminTime2);
            if(currentEarliestAdminTime > otherAdminTime)
            {
                currentEarliestAdminTime = otherAdminTime;
            }
        }
        if(pillQuantity > 3){
            otherAdminTime = parseInt(this.props.formData[0].adminTime3);
            if(currentEarliestAdminTime > otherAdminTime)
            {
                currentEarliestAdminTime = otherAdminTime;
            }
        }

        //console.log("Current earliest time:" + currentEarliestAdminTime);
        return currentEarliestAdminTime;
    };

    render(){
        //console.log(this.generateDataSingle(this.props.data.percentile10));
        //setting advanced page data if null
        let advancedPageData = this.props.formData[3]
            ? this.props.formData[3]
            : {
                numberOfSimulations: '1000',
                tsTimeHalfDayAM: '8',
                teTimeHalfDayAM: '12',
                tsTimeHalfDayPM: '12',
                teTimeHalfDayPM: '16',
                cMinTherapeuticHalfDayAM: '6',
                cMaxTherapeuticHalfDayAM: '20',
                cMinTherapeuticDayPM: '6',
                cMaxTherapeuticDayPM: '20',
                cMinTherapeuticEvening: '0',
                cMaxTherapeuticEvening: '6',
                threshold: '80'
            };
        //PREPERATION
        //Boxes
        //first box
        let firstBoxX = parseFloat(this.props.formData[1].tsDay);
        let firstBoxY = null;
        let firstBoxWidth = parseFloat(this.props.formData[1].teDay)-parseFloat(this.props.formData[1].tsDay);
        let firstBoxHeight = null;
        //secondBox
        let secondBoxX = parseFloat(this.props.formData[1].tsPM);
        let secondBoxY = null;
        let secondBoxWidth = parseFloat(this.props.formData[1].tePM)-parseFloat(this.props.formData[1].tsPM);
        let secondBoxHeight = null;
        //eveningBox
        let eveningBoxX = parseFloat(this.props.formData[1].tsEvening);
        let eveningBoxY = parseFloat(advancedPageData.cMinTherapeuticEvening);
        let eveningBoxWidth = parseFloat(this.props.formData[1].teEvening)-parseFloat(this.props.formData[1].tsEvening);
        let eveningBoxHeight = parseFloat(advancedPageData.cMaxTherapeuticEvening)-parseFloat(advancedPageData.cMinTherapeuticEvening);

        if(this.props.formData[1].nbTherapeuticBoxes === "Two therapeutic boxes (AM and PM)") {
            //console.log("Passed if in graphComponent");
            firstBoxY = parseFloat(advancedPageData.cMinTherapeuticHalfDayAM);
            firstBoxHeight = parseFloat(advancedPageData.cMaxTherapeuticHalfDayAM)-parseFloat(advancedPageData.cMinTherapeuticHalfDayAM);
            secondBoxY = parseFloat(advancedPageData.cMinTherapeuticDayPM);
            secondBoxHeight = parseFloat(advancedPageData.cMaxTherapeuticDayPM)-parseFloat(advancedPageData.cMinTherapeuticDayPM);
        }
        else{
            //console.log("are in else in graphComponent");
            firstBoxY = parseFloat(advancedPageData.cMinTherapeuticDayPM);
            firstBoxHeight = parseFloat(advancedPageData.cMaxTherapeuticDayPM)-parseFloat(advancedPageData.cMinTherapeuticDayPM);
        }

        //percentages
        let firstBoxPercentage = null;
        let secondBoxPercentage = null;
        //substr removes the %
        let eveningBoxPercentage = parseFloat(this.props.data.TIEffE);
        if(this.props.formData[1].nbTherapeuticBoxes === "Two therapeutic boxes (AM and PM)")
        {
            firstBoxPercentage = parseFloat(this.props.data.TIEffD1s);
            secondBoxPercentage = parseFloat(this.props.data.TIEffD2);
        }
        else{
            firstBoxPercentage = parseFloat(this.props.data.TIEffD2);
        }

        //these are the texts versions
        let displayText = ["Total Score: "+ this.props.data.TotalScore,"Roller Coaster Effect: "+this.props.data.rce];
        //these are only the values
        let totalScoreAndRce = [this.props.data.TotalScore, this.props.data.rce];
        //configuring bed and lunch times
        let lunchTime = convertTimeToDecimal(this.props.formData[1].lunch);
        let bedTime = convertTimeToDecimal(this.props.formData[1].bed);
        ///ACTUAL RENDERING STARTS HERE
        return(
            <View style={[this.props.style]} pointerEvents="none">
                <VictoryChart
                    animate={Platform.OS==="ios"?{ duration: this.state.animationTime}:null}
                    domain={{x:[0,30],y: [0,25]}}
                    label ={{x:"A",y:"B"}}
                >
                    <VictoryArea
                        style={{data: {fill: '#cbe3f3'}}}
                        data={this.generateDataDouble(this.props.data.percentile10, this.props.data.percentile90)}
                    />
                    <VictoryArea
                        style={{data: {fill: '#a7cfeb'}}}
                        data={this.generateDataDouble(this.props.data.percentile20, this.props.data.percentile80)}
                    />
                    <VictoryArea
                        style={{data: {fill: '#8dc1e5'}}}
                        data={this.generateDataDouble(this.props.data.percentile30, this.props.data.percentile70)}
                    />
                    <VictoryArea
                        style={{data: {fill: '#7bb7e1'}}}
                        data={this.generateDataDouble(this.props.data.percentile40, this.props.data.percentile60)}
                    />
                    <VictoryLine
                        style={{data: {stroke: '#4c92cd'}}}
                        data={this.generateDataSingle(this.props.data.percentileY)}
                    />

                    <VictoryLine
                        style={{data:{stroke:this.scoreColorIdentification(firstBoxPercentage)}}}
                        data={this.generateSquareTopLeft(firstBoxX,firstBoxY,firstBoxHeight,firstBoxWidth)}
                    />
                    <VictoryLine
                        style={{data:{stroke:this.scoreColorIdentification(firstBoxPercentage)}}}
                        data={this.generateSquareBottomRight(firstBoxX,firstBoxY,firstBoxHeight,firstBoxWidth)}
                    />

                    <VictoryLine
                        style={{data:{stroke:(secondBoxPercentage !== null)? this. scoreColorIdentification(secondBoxPercentage):"transparent"}}}
                        data={this.generateSquareTopLeft(secondBoxX,secondBoxY,secondBoxHeight,secondBoxWidth)}
                    />
                    <VictoryLine
                        style={{data:{stroke:(secondBoxPercentage !== null)? this. scoreColorIdentification(secondBoxPercentage):"transparent"}}}
                        data={this.generateSquareBottomRight(secondBoxX,secondBoxY,secondBoxHeight,secondBoxWidth)} //(x,y,height,width)
                    />

                    <VictoryLine
                        style={{data:{stroke:this.scoreColorIdentification(eveningBoxPercentage)}}}
                        data={this.generateSquareTopLeft(eveningBoxX,eveningBoxY,eveningBoxHeight,eveningBoxWidth)}
                    />
                    <VictoryLine
                        style={{data:{stroke:this.scoreColorIdentification(eveningBoxPercentage)}}}
                        data={this.generateSquareBottomRight(eveningBoxX,eveningBoxY,eveningBoxHeight,eveningBoxWidth)}
                    />
                    <VictoryLine
                        style={{data:{stroke:"#00d9e2"}}}
                        data={this.generateVerticalLine(lunchTime)}
                    />
                    <VictoryLine
                        style={{data:{stroke:"#0700a6"}}}
                        data={this.generateVerticalLine(bedTime)}
                    />

                    <VictoryLabel text={(firstBoxPercentage !== null)?firstBoxPercentage+"%": "There was an error because this is null"} datum={{x:firstBoxX,y:firstBoxY+firstBoxHeight+1}}/>
                    <VictoryLabel text={(secondBoxPercentage !== null)?secondBoxPercentage+"%":""} datum={{x:secondBoxX,y:secondBoxY+secondBoxHeight+1
                    }}/>
                    <VictoryLabel text={eveningBoxPercentage+"%"} datum={{x:eveningBoxX,y:eveningBoxY+eveningBoxHeight+1}}/>
                    <VictoryLabel text={"Time (h)"} datum={{x:29,y:1}}/>
                    <VictoryLabel text={"Concentration (ng/mL)"} datum={{x:0,y:26}}/>
                    <VictoryLabel text={"Lunch Time"} datum={{x:lunchTime-2,y:24}}/>
                    <VictoryLabel text={"Bed Time"} datum={{x:bedTime-2.5,y:24}}/>
               </VictoryChart>
                <TouchableHighlight
                    onPress={()=>{console.log("this was pressed right now"); alert("RollerCoaster Effect: " + displayText[1] +"\n Total Score: " + displayText[0]+"%")}}
                >
                    <View style={styles.scoreContainerStyle}>
                        <Animated.View
                            style={[
                                {
                                    // opacity: this.state.fadeAnim.interpolate({
                                    //         inputRange: [1,1.1],
                                    //         outputRange: [1,1.1]
                                    // })

                                },
                                {
                                    alignItems:'center',
                                }
                            ]}
                        >
                            <View style={styles.scoresStyle}>
                                <Text style={{color:this.scoreColorIdentification(parseFloat(totalScoreAndRce[0]))}}>{displayText[0] + "%"}</Text>
                            </View>
                            <View style={styles.scoresStyle}>
                                <Text style={{color:this.scoreColorIdentification(parseFloat(totalScoreAndRce[1]))}}>{displayText[1] + "%"}</Text>
                            </View>
                        </Animated.View>
                    </View>
                </TouchableHighlight>
            </View>
        )
    }


}

const styles = StyleSheet.create({
    buttonStyle: {
        width: 300
    },

    scoreContainerStyle: {
        padding : 1,
        borderWidth: 0.5,
        borderColor: "black"
    },

    scoresStyle: {
        padding :10,
        borderWidth: 0.5,
        borderColor: "black",
        width: "100%",
        alignItems: 'center'

    }
});

export default (GraphComponent);