
import './App.css';
import {useSession, useSupabaseClient, useSessionContext} from "@supabase/auth-helpers-react";
import DateTimePicker from 'react-datetime-picker'
import 'react-datetime-picker/dist/DateTimePicker.css'
import 'react-calendar/dist/Calendar.css'
import 'react-clock/dist/Clock.css'
import {useState} from "react";

function App() {
    const [start, setStart] = useState(new Date())
    const [end, setEnd] = useState(new Date())
    const [eventName, setEventName] = useState('')
    const [eventDescription, setEventDescription] = useState('')

    const session = useSession()
    const supabase = useSupabaseClient()
    const { isLoading} = useSessionContext()

    if (isLoading)
        return <></>
    async function googleSignIn() {
        const {error} = await supabase.auth.signInWithOAuth(
            {
                provider: 'google',
                options: {
                    scopes: 'https://www.googleapis.com/auth/calendar'
                }
            }
        )
        if (error)
            console.log(error)
    }

    async function signOut() {
        await supabase.auth.signOut()
    }

    async function createCalendarEvent() {
        const event = {
            summary: eventName,
            description: eventDescription,
            start: {
                dateTime: start.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
                dateTime: end.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        }
        await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${session.provider_token}`
            },
            body: JSON.stringify(event)
        }).then(data => data.json())
            .then(data => {
                console.log(data)
                alert('Event created. Check your calendar')
            })
            .catch(err => {
                console.log(err)
                alert('Failed to create. Check your console')
            })
    }
    //console.log(session)

    return (
        <div className="App">
            <div style={{width: "400px", margin: "30px auto"}}>
                {
                    session ?
                        <>
                            <h2> Hey there {session.user.email}</h2>
                            <p>Start of your event</p>
                            <DateTimePicker onChange={setStart} value={start}/>
                            <p>End of your event</p>
                            <DateTimePicker onChange={setEnd} value={end}/>
                            <p>Event name</p>
                            <input type='text' onChange={e=>setEventName(e.target.value)} value={eventName}/>
                            <p>Event description</p>
                            <input type='text' onChange={e=>setEventDescription(e.target.value)} value={eventDescription}/>
                            <hr/>
                            <button onClick={createCalendarEvent}>Create calendar event</button>
                            <p></p>
                            <button onClick={signOut}>Sign out</button>

                        </>
                        :
                        <button onClick={googleSignIn}>Sign in with Google</button>
                }
            </div>
        </div>
    );
}

export default App;
