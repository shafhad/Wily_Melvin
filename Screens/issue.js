/*import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity, Image,TextInput,KeyboardAvoidingView,ToastAndroid, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
//import * as firebase from 'firebase'
import firebase from "firebase/app"
import db from "../config.js"


export default class issues extends React.Component{
    constructor(){
        super();
        this.state={
            cameraPermission:null,
            scanned:false,
            scannedBookID:'',
            scannedStudentID:'',
            buttonState:"normal",
        transactionmsg : ''
        }
    }

    getCameraPermission=async id=>{
        const{status}=await Permissions.askAsync(Permissions.CAMERA)
        
        this.setState({
            cameraPermission:status==="granted",
            ButtonState:id,
            scanned:false
        })
    }

    handleBarCodeScanner=async({type,data})=>{
        const {ButtonState}=this.state
        if(ButtonState==="BookID"){
        this.setState({
            scanned:true,
            scannedBookID:data,
            buttonState:"normal"
        })
        }else if(ButtonState==="StudentId"){
            this.setState({
                scanned:true,
                scannedStudentID:data,
                buttonState:"normal"
            })  
        }
    }
    checkBookeligibility=async()=>{
        console.log(false)
        const bookref=await db.collection("Books").where("BookID",'==',this.state.scannedBookID).get()
        var Transactiontype=""
        if(bookref.docs.length===0){
            console.log(false)
            Transactiontype=false
        }else{
            console.log(false)
            bookref.docs.map((doc)=>{
                var book=doc.data()
                if(book.BookAvailability){
                    Transactiontype="Issue"
                }else{
                    Transactiontype="Return"
                }
            })
        }
        return Transactiontype
    }
    
    handledTransaction=async()=>{
        console.log(false)
        var Transactiontype=await this.checkBookeligibility();
        if(!Transactiontype){
            console.log(false)
            Alert.alert("The Book Doesn't Exsists in the Database")
            this.setState({
                scannedStudentID:'',
                scannedBookID:''
            })
        }else if(Transactiontype==="Issue"){
            var isStudentEligible=await this.checkforissue()
            if(isStudentEligible){
                this.initiateBookIssue()
            }
        }else{
            var isStudentEligible=await this.checkforReturn()
            if(isStudentEligible){
                this.initiateBookReturn()
            }
        }
    }
    checkforissue=async()=>{
        const studentref=await db.collection("Student").where("StudentID",'==',this.state.scannedStudentID).get()
        var isStudentEligible=""
        if(studentref.docs.length===0){
            this.setState({
                scannedStudentID:"",
                scannedBookID:""
            })
            isStudentEligible=false
            Alert.alert("The Student Doesn't Exsists")
        }else{
            studentref.docs.map((doc)=>{
                var student=doc.data()
                if(student.BooksIssued<3){
                    isStudentEligible=true
                }else{
                    isStudentEligible=false
                    Alert.alert("Already Issued Two Books")
                    this.setState({
                        scannedStudentID:"",
                        scannedBookID:""
                    })
                }
            })
        }
        return isStudentEligible
    }
    checkforReturn=async()=>{
        const Transref=await db.collection("Transaction").where("BookID",'==',this.state.scannedBookID).get()
        var isStudentEligible=""
        Transref.docs.map((doc)=>{
            var lasttrans=doc.data()
            if(lasttrans.StudentID===this.state.scannedStudentID){
                isStudentEligible=true
            }else{
                isStudentEligible=false
                Alert.alert("The Book Wasn't Issued by this student")
                this.setState({
                    scannedStudentID:"",
                    scannedBookID:""
                })
            }
        })
        return isStudentEligible
    }
    initiateBookIssue=async()=>{
        console.log("issue")
        console.log(this.state.scannedBookID)
        console.log(this.state.scannedStudentID)
        db.collection("Transaction").add({
            "StudentID":this.state.scannedStudentID,
            "BookID":this.state.scannedBookID,
            "Date":firebase.firestore.Timestamp.now().toDate(),
            "Transactiontype":"Issue"
        })
        console.log(this.state.scannedBookID)
        db.collection("Books").doc(this.state.scannedBookID).update({
          
            "BookAvailability":false
        })
        db.collection(Students).doc(this.state.scannedStudentID).update({
            "BooksIssued":firebase.firestore.FieldValue.increment(1)
        })
        this.setState({
            scannedBookID :'',
            scannedStudentID :''
        })
      
    }
    initiateBookReturn = async()=>{
        console.log("return")
        console.log(this.state.scannedBookID)
        console.log(this.state.scannedStudentID)
        db.collection("Transaction").add({
            "StudentID":this.state.scannedStudentID,
            "BookID":this.state.scannedBookID,
            "Date":firebase.firestore.Timestamp.now().toDate(),
            "Transactiontype":"Return"
        })
        console.log(this.state.scannedBookID)
        db.collection("Books").doc(this.state.scannedBookID).update({
            BookAvailability:true
        })
        db.collection("Students").doc(this.state.scannedStudentID).update({
            BooksIssued:firebase.firestore.FieldValue.increment(-1)
        })
        this.setState({
            scannedStudentID :'',
            scannedBookID : ''
        })
        
    }
    render(){
        const cameraPermission=this.state.cameraPermission;
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonState
        if(buttonState!=="normal"&&cameraPermission){
            return(
                <BarCodeScanner
                onBarCodeScanned={scanned?undefined:this.handleBarCodeScanner}
                styles={StyleSheet.absoluteFillObject}/>
            );
        } 
        else if(buttonState==="normal"){
            return(
                
                <View style={styles.Container}>
                <View><Image
                source={require("../assets/booklogo.jpg")}
                style={{width:40,height:40}}
                /><Text style={{textAlign:"center",fontSize:30}}>Willy</Text>
                </View>
                <View style={styles.inputView}>
                <TextInput
                style={styles.inputBox}
                placeholder="bookID"
                onChangeText={text =>this.setState({scannedBookID:text})}
                value={this.state.scannedBookID}
                />
                <TouchableOpacity 
                style={styles.scanButton}
                onPress={()=>
                {this.getCameraPermission("BookId")}                
                }
                >
                    <Text style={styles.buttonText}>Scan</Text>
                </TouchableOpacity>
                </View>
                <View style={styles.inputView}>
                <TextInput
                style={styles.inputBox}
                placeholder="StudentID"
                onChangeText={text =>this.setState({scannedStudentID:text})}
                value={this.state.scannedStudentID}
                />
                <TouchableOpacity 
                style={styles.scanButton}
                onPress={()=>
                {this.getCameraPermission("StudentId")}                
                }
                >
                 <Text style={styles.buttonText}>Scan</Text>
                </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity 
                    style={styles.submitButton}onPress={async()=>{
                        var transactionmsg= this.handledTransaction();
                   // this.State({
                       // scannedBookID :'',
                      //  scannedStudentID: ''
                  //  })                 
                    }}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
            )
        }
    }
}
const styles=StyleSheet.create({
    Container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    DisplayText:{
        fontSize:20
        //textDocumentLine:'underline',
    },
    scanButton:{
        backgroundColor:"red",
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0
    },
    buttonText:{
        fontSize:20,
        textAlign:'center',
        marginTop:10,
    },
    inputView:{
        flexDirection:"row",
        margin:20,
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    
})

*/

import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from "firebase/app"
import db from '../config.js'

export default class issues extends React.Component {
    constructor(){
        super();
        this.state = {
          hasCameraPermissions: null,
          scanned: false,
          scannedBookId: '',
          scannedStudentId:'',
          buttonState: 'normal',
          transactionMessage: ''
        }
      }
  
      getCameraPermission = async (id) =>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        
        this.setState({
          /*status === "granted" is true when user has granted permission
            status === "granted" is false when user has not granted the permission
          */
          hasCameraPermissions: status === "granted",
          buttonState: id,
          scanned: false
        });
      }
  
      handleBarCodeScanner = async({type, data})=>{
        const {buttonState} = this.state
  
        if(buttonState==="BookId"){
          this.setState({
            scanned: true,
            scannedBookId: data,
            buttonState: 'normal'
          });
        }
        else if(buttonState==="StudentId"){
          this.setState({
            scanned: true,
            scannedStudentId: data,
            buttonState: 'normal'
          });
        }
        
      }
  
      initiateBookIssue = async()=>{
        //add a transaction
        db.collection("transactions").add({
          'studentId': this.state.scannedStudentId,
          'bookId' : this.state.scannedBookId,
          'date' : firebase.firestore.Timestamp.now().toDate(),
          'transactionType': "Issue"
        })
        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
          'bookAvailability': false
        })
        //change number  of issued books for student
        db.collection("students").doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
        })
  
        Alert.alert("Book issued!")
  
        this.setState({
          scannedStudentId: '',
          scannedBookId: ''
        })
      }
  
      initiateBookReturn = async()=>{
        //add a transaction
        db.collection("transactions").add({
          'studentId': this.state.scannedStudentId,
          'bookId' : this.state.scannedBookId,
          'date' : firebase.firestore.Timestamp.now().toDate(),
          'transactionType': "Return"
        })
        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
          'bookAvailability': true
        })
        //change number  of issued books for student
        db.collection("students").doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
        })
  
        this.setState({
          scannedStudentId: '',
          scannedBookId: ''
        })
      }
  
      checkBookeligibility = async()=>{
        const bookRef = await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
        var transactionType = ""
        if(bookRef.docs.length == 0){
          transactionType = "false";
          console.log(bookRef.docs.length)
        }
        else{
          bookRef.docs.map((doc)=>{
            var book = doc.data()
            if (book.bookAvailability)
              transactionType = "Issue"
            else
              transactionType = "Return"
            
          })
        }
  
        return transactionType
        
      }
  
      checkforissue = async()=>{
        const studentRef = await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
        var isStudentEligible = ""
        if(studentRef.docs.length == 0){
          this.setState({
            scannedStudentId: '',
            scannedBookId: ''
          })
          isStudentEligible = false
          Alert.alert("The student id doesn't exist in the database!")
        }
        else{
           studentRef.docs.map((doc)=>{
              var student = doc.data();
              if(student.numberOfBooksIssued < 2){
                isStudentEligible = true
              }
              else{
                isStudentEligible = false
                Alert.alert("The student has already issued 2 books!")
                this.setState({
                  scannedStudentId: '',
                  scannedBookId: ''
                })
              }
  
            })
  
        }
  
        return isStudentEligible
  
      }
  
      checkforReturn = async()=>{
        const transactionRef = await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
        var isStudentEligible = ""
        transactionRef.docs.map((doc)=>{
          var lastBookTransaction = doc.data();
          if(lastBookTransaction.studentId === this.state.scannedStudentId)
            isStudentEligible = true
          else {
            isStudentEligible = false
            Alert.alert("The book wasn't issued by this student!")
            this.setState({
              scannedStudentId: '',
              scannedBookId: ''
            })
          }
            
        })
        return isStudentEligible
      }
  

      
  
      handledTransaction = async()=>{
       
        var transactionType = await this.checkBookeligibility();
        console.log("Transaction Type", transactionType)
        if (!transactionType) {
          Alert.alert("The book doesn't exist in the library database!")
          this.setState({
            scannedStudentId: '',
            scannedBookId: ''
          })
        }
  
        else if(transactionType === "Issue"){
          var isStudentEligible = await this.checkforissue()
          if(isStudentEligible)
            this.initiateBookIssue()
            Alert.alert("Book issued to the student!")     
        }
  
        else{
          var isStudentEligible = await this.checkforReturn()
          if(isStudentEligible)
            this.initiateBookReturn()
            Alert.alert("Book returned to the library!")
        }
      }
  
      render() {
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
  
        if (buttonState !== "normal" && hasCameraPermissions){
          return(
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
          );
        }
  
        else if (buttonState === "normal"){
          return(
            <KeyboardAvoidingView behavior="padding" style={styles.Container}>
              <View>
                <Image
                  source={require("../assets/booklogo.jpg")}
                  style={{width:40, height: 40}}/>
                <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
              </View>
              <View style={styles.inputView}>
              <TextInput 
                style={styles.inputBox}
                placeholder="BookID"
                onChangeText={(text)=>{
                  this.setState({
                    scannedBookId: text
                  })
                }}
                value={this.state.scannedBookId}/>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={()=>{
                  this.getCameraPermissions("BookId")
                }}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
              </View>
  
              <View style={styles.inputView}>
              <TextInput 
                style={styles.inputBox}
                placeholder="StudentID"
                onChangeText={(text)=>{
                  this.setState({
                    scannedStudentId: text
                  })
                }}
                value={this.state.scannedStudentId}/>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={()=>{
                  this.getCameraPermissions("StudentId")
                }}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
              </View>
              <Text style={styles.transactionAlert}>{this.state.transactionMessage}</Text>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={async()=>{
                  var transactionMessage = this.handledTransaction();
                  console.log("Transaction Message: ",transactionMessage)
                }}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          );
        }
      }
    }
  const styles=StyleSheet.create({
    Container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    DisplayText:{
        fontSize:20
        //textDocumentLine:'underline',
    },
    scanButton:{
        backgroundColor:"red",
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0
    },
    buttonText:{
        fontSize:20,
        textAlign:'center',
        marginTop:10,
    },
    inputView:{
        flexDirection:"row",
        margin:20,
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    
})