import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Linking,
} from "react-native";
import * as BackgroundFetch from "expo-background-fetch"
import * as TaskManager from "expo-task-manager"
import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabase('db.testDb') // returns Database object
const TASK_NAME = "BACKGROUND_TASK"
const URL = "https://pokeapi.co/api/v2/pokemon?limit=100&offset=200"

TaskManager.defineTask(TASK_NAME, () => {
    try {
        // fetch data here...
        let receivedNewData;
        fetch(URL).then(r => r.json()).then(json => {
            receivedNewData = json.results

            receivedNewData.map(item => {
                db.transaction(tx => {
                    tx.executeSql('INSERT INTO links (name, url) values (?, ?)', [item.name, item.url],
                        (txObj, resultSet) => { },
                        (txObj, error) => console.log('Error', error))
                })
            })
            console.log('received outside')
        })

        return receivedNewData
            ? BackgroundFetch.Result.NewData
            : BackgroundFetch.Result.NoData
    } catch (err) {
        return BackgroundFetch.Result.Failed
    }
})

const RegisterBackgroundTask = async () => {
    try {
        await BackgroundFetch.registerTaskAsync(TASK_NAME, {
            minimumInterval: 5, // seconds,
        })
        console.log("Task registered")
    } catch (err) {
        console.log("Task Register failed:", err)
    }
}

const Home = ({ }) => {
    const [data, setData] = useState([])

    const fetchData = () => {
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM links', null, // passing sql query and parameters:null
                // success callback which sends two things Transaction object and ResultSet Object
                (txObj, { rows: { _array } }) => setData(_array),
                // failure callback which sends two things Transaction object and Error
                (txObj, error) => console.log('Error ', error)
            )
        })
    }

    useEffect(() => {
        RegisterBackgroundTask()
    }, [])

    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, url TEXT)'
            )
        })
        fetchData()
    }, [])

    return (
        <ScrollView style={styles.container}>
            {data.length == 0 ?
                <Text style={{ fontWeight: '600' }}>If opening for the first time, data will be fetched in background in around 10 minutes interval and stored to the SQL database and will be shown here. If already fetched and stored once, that data will be displayed.</Text>
                :
                data.map(item => {
                    return (
                        <View key={item.name} style={styles.item}>
                            <Text style={{ textDecorationLine: 'underline', color: 'blue' }}
                                onPress={() => Linking.openURL(item.url)}>{item.url}</Text>
                            <Text style={styles.name}>{item.name}</Text>
                        </View>
                    )
                })
            }
        </ScrollView>
    )
};
export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15
    },
    item: {
        margin: 15,
        marginHorizontal: 0,
        padding: 8,
        backgroundColor: '#ebecf0',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    imageContainer: {
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'red'
    },
    image: {
        height: 50,
        width: 50,
        borderRadius: 25
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold'
    }
})