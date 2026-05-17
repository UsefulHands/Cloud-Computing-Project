Program is going to be db role based, not jwt role based.
Program will not use BaseEntity due to limited time resources.
-------------------------------------------------------------------------------------------

Entity: User
id,              Long
name,            String, unique
password,        String, BCrypt
role,            String, MANAGER | MEMBER
Dto:    UserDto
name,            String
--------------------------------------------------------------------------------------------

Frontend user will not check, ask, get for role anytime, anywhere. Will not do computation neither. Frontend user will try
to use the url. And backend will check the role and return the page or not.
--------------------------------------------------------------------------------------------

Frontend developer will not lose time with nonfunctional features that being pleased to eye.
Backend developer will not lose time with security things. It always can be more secure.
--------------------------------------------------------------------------------------------

Delete: Soft Delete
Roles: MANAGER, MEMBER
--------------------------------------------------------------------------------------------

FRONTEND:
default Page: /Homepage          ← if token exists, GET /api/briefings/me
/Homepage navbar dropdown: createBriefing, ← requires token
attendBriefing, ← requires token, GET /api/briefings/{briefingId}
user enters briefingId, backend returns briefing
login
register

FRONTEND LAYOUT:
/Homepage          ← if token exists, redirects to /briefings/me

/briefings/me      ← split screen layout, WhatsApp-like
left panel:  list of briefings user belongs to, shown as icons
right panel: selected briefing opens in full view
messages, notes, users visible
default:     no briefing selected, right panel empty

--------------------------------------------------------------------------------------------

Entity: Briefing
id,              Long
subject,         String
description,     String
notes[],         List<Note>
messages[],      List<Message>
briefingUsers[], List<BriefingUser>
isDeleted        boolean

Dto   : BriefingDto
managerName,     String
subject,         String
description,     String
notes[],         List<NoteDto>
messages[],      List<MessageDto>
briefingUsers[]  List<BriefingUserDto>

Dto   : CreateBriefingDto        ← POST   /api/briefings, userId from token, briefingRole set to MANAGER
subject,         String
description,     String

Dto   : UpdateBriefingDto        ← PUT    /api/briefings/{briefingId}, managerId from token
subject,         String
description,     String
.
Dto   : DeleteBriefingDto        ← DELETE /api/briefings/{briefingId}, managerId from token
---

Entity: BriefingUser
briefingId,      Long
userId,          Long
briefingRole,    String
isDeleted        boolean

Dto   : BriefingUserDto          ← GET    /api/briefings/{briefingId}/users
briefing,        BriefingDto
user,            UserDto
briefingRole,    String

Dto   : UpdateBriefingUserDto    ← PUT    /api/briefings/{briefingId}/users/{userId}
briefingRole,    String

Dto   : DeleteBriefingUserDto    ← DELETE /api/briefings/{briefingId}/users/{userId}, userId from token
.
        CreateBriefingUserDto not needed → POST /api/briefings/{briefingId}/users
                                           userId from token, briefingRole always MEMBER
---

Entity: Message
id,              Long
briefingId,      Long
senderId,        Long
content,         String
isDeleted        boolean

Dto   : MessageDto               ← GET    /api/briefings/{briefingId}/messages
senderName,      String
content,         String

Dto   : CreateMessageDto         ← POST   /api/briefings/{briefingId}/messages, senderId from token
content,         String

Dto   : UpdateMessageDto         ← PUT    /api/briefings/{briefingId}/messages/{messageId}, senderId from token
content,         String

Dto   : DeleteMessageDto         ← DELETE /api/briefings/{briefingId}/messages/{messageId}
senderId from token, soft delete, isDeleted set to true
---

Entity: Note
id,              Long
briefingId,      Long
senderId,        Long
subject,         String
content,         String
isDeleted        boolean

Dto   : NoteDto                  ← GET    /api/briefings/{briefingId}/notes
senderName,      String
subject,         String
content,         String

Dto   : CreateNoteDto            ← POST   /api/briefings/{briefingId}/notes, senderId from token
subject,         String
content,         String

Dto   : UpdateNoteDto            ← PUT    /api/briefings/{briefingId}/notes/{noteId}, senderId from token
subject,         String
content,         String

Dto   : DeleteNoteDto            ← DELETE /api/briefings/{briefingId}/notes/{noteId}
senderId from token, soft delete, isDeleted set to true
----------------------------------------------------------------------------------------------
.
TODO For Task 2: joinPassword to be added to Briefing entity later for join protection
----------------------------------------------------------------------------------------------