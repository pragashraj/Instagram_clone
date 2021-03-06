import React ,{Component} from 'react'
import { View,Text,TouchableOpacity,StyleSheet,ScrollView,TextInput ,Image} from 'react-native'

import ImagePicker from 'react-native-image-picker'

import {storage,database,fbase} from '../config/config'
import Spinner from '../components/Spinner'

import {connect} from 'react-redux'

import {setTodayActivities,setMonthActivities,clearTodayActivities} from '../redux/actions/AddActivity'

class AddPostScreen extends Component{

    state={
        Imagefile:{
            filePath:null,
            fileData:null,
            fileUri:null
        },
        showBtn:true,
        captionTxt:'',
        post:{
            caption:'',
            author:'',
            url:'',
            posted:null,
            id:'',
            authorId:''
        },
        loading:false
    }

    options={
        storageOptions:{
            skipBackup:true,
            path:'images',
        }
    }

    handleGalleryBtnPress=()=>{
        ImagePicker.launchImageLibrary(this.options,(response)=>{
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }else{
                this.setState({
                    Imagefile: {
                        filePath: response,
                        fileData: response.data,
                        fileUri: response.uri,
                    },
                    showBtn:false
                })
                
            } 
        })
    }

    handleCameraBtnPress=()=>{
        ImagePicker.launchCamera(this.options,(response)=>{
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
                alert(response.customButton);
            }else{
                this.setState({
                    Imagefile:{
                        filePath: response,
                        fileData: response.data,
                        fileUri: response.uri,
                    },
                    showBtn:false
                })
            } 
        })
    }

    savePost=async()=>{
        this.setState({loading:true})
        const uid=fbase.auth().currentUser.uid
        let author

        var mystatistics={
            posts:0,
            followers:0,
            following:0
        }


        database.ref('ProfileDetails').child(uid).child("Name").on('value',function(snapshot){
            const exist=(snapshot.val()!==null)
            if(exist) author=snapshot.val()
        })

        const ImageId=Math.floor(Math.random()*1000).toString()

        const res=await fetch(this.state.Imagefile.fileUri)
        const blob=await res.blob()
        const date=new Date()
        
        const ref=storage.ref('user/'+uid+'/posts').child(ImageId.toString())
        var snapshot=ref.put(blob).then(res=>{

            ref.getDownloadURL().then(res=>{
               this.setState({
                   post:{
                        author:author,
                        url:res,
                        posted:date.toString(),
                        caption:this.state.captionTxt,
                        id:ImageId,
                        authorId:uid
                   }
               })
            }).then(()=>{

                database.ref(`Posts/${uid}/${ImageId}`).set(this.state.post).then(()=>{
                    this.setState({
                        loading:false,
                        showBtn:true,
                    })           
                })

                const stat={comments:{},likes:{authorLiked:false,count:0}}
                database.ref(`PostStatistics/${ImageId}`).set(stat)

                database.ref('Statistics').child(uid).on('value',function(snapshot){
                    const exist=(snapshot.val()!==null)
                    if(exist) mystatistics=snapshot.val()
                })


                database.ref(`Statistics`).child(uid).update({posts:mystatistics.posts+1})
                
                this.setReducerState()

            })

        })//end of snapshot
    }

    setTodayActivity=()=>{
        const date=new Date()
        this.props.setTodayActivities({
            id:date.toString(),
            date:{
                date:date.getDate(),
                hrs:date.getHours(),
                min:date.getMinutes()
            },
            act:"You have added a post on "+date.toString()
        })
    }

    setReducerState=()=>{
        const date=new Date()
        const data=this.props.todayActivities
        const len=data.length
        if( len > 0){
            if(date.getDate()-data[len-1].date.date>=1){
                this.props.setMonthActivities(data)
                this.props.clearTodayActivities()
                this.setTodayActivity()
            }else{
                this.setTodayActivity()
            }
        }else{
            this.setTodayActivity()
        }
    }

    renderBtnCard=()=>{
        return(
            <View>
                <View style={styles.btnCard}>
                    <Text style={styles.chooseTxt}>Choose here</Text>
                    <View style={styles.btnContainer}>
                        <TouchableOpacity style={styles.btnSelector} onPress={this.handleCameraBtnPress}>
                            <Text style={styles.btnText}>Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btnSelector} onPress={this.handleGalleryBtnPress}>
                            <Text style={styles.btnText}>Gallery</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    renderCaptionCard=()=>{
        return(
            <ScrollView style={styles.captionCard}>
                <View style={styles.captionBlock}>
                    <Text style={styles.captionTxt}>Caption</Text>
                    <TextInput 
                        editable={true}
                        placeholder="Your Caption Here!"
                        multiline={true}
                        autoCorrect={false}
                        numberOfLines={3}
                        maxLength={100}
                        onChangeText={(e)=>this.setState({captionTxt:e})}
                    />
                </View>

                <View style={styles.ImgBlock}>
                    <Image source={{uri:this.state.Imagefile.fileUri}} style={{alignSelf:'stretch',width:null,height:null,flex:1}}  />
                </View>

                <View style={styles.postBtnBlock}>
                    {
                        !this.state.loading ? (
                            <TouchableOpacity style={{flexDirection:'row'}} onPress={this.savePost}>
                                <Text style={styles.postTxt}>Post Now</Text>
                                <Image source={require('../assets/icons/send.png')} style={{width:35,height:35,marginLeft:5}}/>
                            </TouchableOpacity>
                        ):<Spinner size="large"/>
                    }
                </View>

            </ScrollView>
        )
    }

    render(){
        return(
            <View>
                {
                    this.state.showBtn ?  this.renderBtnCard():this.renderCaptionCard()
                }
            </View>
        )
    }
}

const styles=StyleSheet.create({
    btnCard:{
        backgroundColor:'white',
        width:'80%',
        height:150,
        marginHorizontal:'10%',
        marginTop:'10%',
        justifyContent:'center',
        alignItems:'center',
        elevation:4
    },

    chooseTxt:{
        fontSize:18
    },

    btnContainer:{
        flexDirection:'row',
        width:'90%',
        height:40,
        backgroundColor:'aqua',
        marginTop:'2%',
        justifyContent:'center',
        alignItems:'center',
    },

    btnSelector:{
        marginHorizontal:'10%',
    },

    btnText:{
        fontSize:16,
        color:'white',
        fontWeight:'bold'
    },

    captionCard:{
        backgroundColor:'white',
        width:'90%',
        height:450,
        marginHorizontal:'5%',
        marginTop:'10%',
        elevation:4
    },

    captionBlock:{
        padding:'2%',
        height:140,
        width:'100%',
    },

    captionTxt:{
        fontSize:18,
        marginTop:'2%'
    },

    ImgBlock:{
        backgroundColor:'silver',
        height:220,
        width:'100%',
        flex:1
    },

    postBtnBlock:{
        height:90,
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
    },

    postTxt:{
        fontSize:22
    }
})

const mapDispatchToProps=dispatch=>{
    return{
        setTodayActivities:ActivityData=>dispatch(setTodayActivities(ActivityData)),
        setMonthActivities:ActivityData=>dispatch(setMonthActivities(ActivityData)),
        clearTodayActivities:()=>dispatch(clearTodayActivities())
    }
}

const mapStateToProps=({activity:{todayActivities,monthActivities}})=>{
    return{
        todayActivities,
        monthActivities
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(AddPostScreen)
