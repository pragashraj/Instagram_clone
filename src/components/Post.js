import React, { useEffect, useState } from 'react'
import { Text, View , StyleSheet , Image , TouchableOpacity} from 'react-native'
import {database} from '../config/config'

const Post =({navigation,post})=> {
    const [postLikes,setLikes]=useState(0)
    const [postComments,setComments]=useState([])

        useEffect(()=>{
            const id=post.id
            var commentsTmp=[]
            var likesTmp=0
            database.ref('PostStatistics').child(id).on('value',function(snapshot){
                snapshot.child('comments').forEach(item => {
                     var temp = item.val()
                     commentsTmp.push(temp);
                });

                const exist=(snapshot.val()!==null)
                if(exist) likesTmp=snapshot.child('likes').child('count').val()
            })

            setComments(commentsTmp)
            setLikes(likesTmp)

        },[])

        return (
            <View>
                <View style={styles.postHeader}>
                    <View style={styles.proImageBlock}>
                        <Image source={require('../assets/icons/proImage.png')} style={styles.proImage}/>
                    </View>

                    <View style={styles.postHolderBlock}>
                        <Text style={styles.postHolder}>{post.author}</Text>
                    </View>

                    <View style={styles.moreBlock}>
                        <TouchableOpacity onPress={()=>console.warn(postData)}>
                            <Image source={require('../assets/icons/more.png')} style={styles.moreImage}/>
                        </TouchableOpacity>
                    </View>
                       
                </View>

                <View style={styles.post}>
                    <Image source={{uri:post.url}} style={styles.postContent}/>
                </View>

                <View style={styles.userAction}>
                    <TouchableOpacity>
                        <Image source={require('../assets/icons/like.png')} style={styles.actions}/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>{navigation.navigate('Comments',{post,postLikes,postComments})}}>
                        <Image source={require('../assets/icons/comments.png')} style={styles.actions}/>
                    </TouchableOpacity>

                </View>

                <View style={styles.likesCountBlock}>
                    <Text style={styles.likesCount}>Liked by  {postLikes} </Text>
                </View>

                <View style={styles.commentsBlock}>
                    <Text style={styles.comments}>view comments .....</Text>
                </View>

            </View>
        )
}

const styles=StyleSheet.create({

    postHeader:{
        width:'100%',
        height:50,
        flexDirection:'row',
        alignItems:'center',
        borderTopWidth:0.2,
        backgroundColor:'white',
    },

    proImageBlock:{
        width:'15%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center'
    },

    proImage:{
        width:'65%',
        height:'90%',
    },

    postHolderBlock:{
        width:'65%',
        height:'100%',
        justifyContent:'center',
    },

    postHolder:{
        fontSize:17,
    },

    moreBlock:{
        width:'20%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center'
    },

    post:{
        width:'100%',
        height:300,
    },

    postContent:{
        width:'100%',
        height:'100%',
    },

    userAction:{
        width:'100%',
        height:50,
        backgroundColor:'white',
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:'2%'
    },

    actions:{
        marginLeft:'5%'
    },

    likesCountBlock:{
        width:'100%',
        height:30,
        justifyContent:'center',
        backgroundColor:'white'
    },

    likesCount:{
        marginLeft:'4%',
        fontSize:16,
    },


    commentsBlock:{
        width:'100%',
        height:40,
        justifyContent:'center',
        backgroundColor:'white',
        borderBottomWidth:0.2
    },

    comments:{
        marginLeft:'4%',
        fontSize:16,
    }
})

export default Post