--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.wedding_profiles DROP CONSTRAINT IF EXISTS wedding_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.vendors DROP CONSTRAINT IF EXISTS vendors_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.guests DROP CONSTRAINT IF EXISTS guests_pkey;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_pkey;
ALTER TABLE IF EXISTS ONLY public.budget_items DROP CONSTRAINT IF EXISTS budget_items_pkey;
ALTER TABLE IF EXISTS public.wedding_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.vendors ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tasks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.guests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.budget_items ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.wedding_profiles_id_seq;
DROP TABLE IF EXISTS public.wedding_profiles;
DROP SEQUENCE IF EXISTS public.vendors_id_seq;
DROP TABLE IF EXISTS public.vendors;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.tasks_id_seq;
DROP TABLE IF EXISTS public.tasks;
DROP SEQUENCE IF EXISTS public.guests_id_seq;
DROP TABLE IF EXISTS public.guests;
DROP SEQUENCE IF EXISTS public.events_id_seq;
DROP TABLE IF EXISTS public.events;
DROP SEQUENCE IF EXISTS public.budget_items_id_seq;
DROP TABLE IF EXISTS public.budget_items;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: budget_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_items (
    id integer NOT NULL,
    category text NOT NULL,
    vendor text NOT NULL,
    description text,
    estimated_amount integer NOT NULL,
    actual_amount integer DEFAULT 0,
    paid_amount integer DEFAULT 0,
    status text DEFAULT 'pending'::text NOT NULL,
    event_id integer,
    wedding_profile_id integer,
    paid_by text
);


--
-- Name: budget_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budget_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budget_items_id_seq OWNED BY public.budget_items.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    date text NOT NULL,
    "time" text NOT NULL,
    location text NOT NULL,
    progress integer DEFAULT 0,
    icon text NOT NULL,
    color text NOT NULL,
    guest_count integer DEFAULT 0,
    wedding_profile_id integer NOT NULL
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: guests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guests (
    id integer NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    side text NOT NULL,
    rsvp_status text DEFAULT 'pending'::text,
    wedding_profile_id integer NOT NULL
);


--
-- Name: guests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.guests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: guests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.guests_id_seq OWNED BY public.guests.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    status text DEFAULT 'todo'::text NOT NULL,
    assigned_to text NOT NULL,
    due_date text,
    event_id integer,
    wedding_profile_id integer
);


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text NOT NULL,
    name text NOT NULL,
    wedding_profile_id integer
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    contact text,
    email text,
    phone text,
    address text,
    website text,
    contract_url text,
    notes text,
    wedding_profile_id integer,
    total_price integer,
    security_deposit integer,
    paid_by text
);


--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: wedding_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wedding_profiles (
    id integer NOT NULL,
    bride_name text NOT NULL,
    groom_name text NOT NULL,
    wedding_start_date text NOT NULL,
    wedding_end_date text NOT NULL,
    venue text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    guest_count integer NOT NULL,
    budget integer NOT NULL,
    functions text[] NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    is_complete boolean DEFAULT false
);


--
-- Name: wedding_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wedding_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wedding_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wedding_profiles_id_seq OWNED BY public.wedding_profiles.id;


--
-- Name: budget_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_items ALTER COLUMN id SET DEFAULT nextval('public.budget_items_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: guests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests ALTER COLUMN id SET DEFAULT nextval('public.guests_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Name: wedding_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_profiles ALTER COLUMN id SET DEFAULT nextval('public.wedding_profiles_id_seq'::regclass);


--
-- Data for Name: budget_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budget_items (id, category, vendor, description, estimated_amount, actual_amount, paid_amount, status, event_id, wedding_profile_id, paid_by) FROM stdin;
1	venue	Royal Banquet Hall	Wedding venue booking	150000	145000	50000	partial	\N	\N	\N
2	photography	Moments Studio	Wedding photography and videography	75000	80000	80000	paid	\N	\N	\N
3	catering	Delicious Catering	Food and beverages for all events	200000	\N	\N	pending	\N	\N	\N
4	attire	Elegant Fashions	Bridal lehenga and accessories	100000	95000	95000	paid	\N	\N	\N
5	flowers	Blooms & Blossoms	Floral decorations and garlands	50000	\N	\N	pending	\N	\N	\N
6	music	Bollywood Beats	DJ and sound system for sangeet	40000	35000	17500	partial	\N	\N	\N
7	photography	Amber Rain Photography	Vendor service for Amber Rain Photography	8800	8800	600	partial	\N	3	bride
8	planning	Events By Sep	Vendor service for Events By Sep	8250	8250	5775	partial	\N	3	bride
10	makeup	Drea	Budget item for Drea	7760	0	500	partial	\N	3	bride
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, name, description, date, "time", location, progress, icon, color, guest_count, wedding_profile_id) FROM stdin;
2	Ganesh Puja	Prayer ceremony to Lord Ganesha for auspicious beginnings	2024-12-19	10:00 AM	Hotel Prayer Room	90	flower	orange	30	2
3	Haldi Ceremony	Turmeric ceremony for purification and blessings	2024-12-20	11:00 AM	Bridal Suite	85	sun	yellow	40	2
4	Sangeet Night	Musical celebration with dance and performances	2024-12-17	7:00 PM	Event Venue	60	music	purple	200	2
5	Wedding Ceremony	Main wedding ceremony	2024-12-18	11:00 AM	Temple	85	ring	red	350	2
6	Reception	Celebration dinner party	2024-12-18	7:00 PM	Luxury Resort	40	champagne-glasses	indigo	500	2
7	Ganesh Puja	Prayer ceremony to Lord Ganesha for auspicious beginnings	2026-06-18	10:00 AM - 12:00 PM	Hilton Bayfront- Hospitality Room	0	🐘	orange	30	3
8	Welcome Party	Welcome celebration for out-of-town guests	2026-06-18	6:00 PM - 11:00 PM	Hangar 858	0	🎉	blue	250	3
9	Haldi	Turmeric ceremony for purification and blessings	2026-06-19	10:00 AM - 12:00 PM	Hilton Bayfront- Terrace	0	🌟	yellow	300	3
10	Sangeet	Musical celebration with dance and performances	2026-06-19	6:00 PM - 12:00 PM	Hilton Bayfront- Indigo Ballroom	0	🎵	purple	300	3
11	Wedding	Main wedding ceremony with sacred rituals	2026-06-20	9:00 AM - 1:00 PM	Hilton Bayfront- Front Lawn	0	💍	red	300	3
12	Reception	Grand celebration and dinner for all guests	2026-06-20	5:30 PM - 12:30 AM	Hilton Bayfront- Sapphire Ballroom	0	🥂	indigo	300	3
13	Bridal Mehndi	A chill, artsy pre-wedding hangout where the bride (and sometimes guests) get their hands and feet decorated with henna. It's usually relaxed, with music, snacks, and lots of photos.	2026-06-17	9 AM - 5PM	Hilton Bayfront- Hospitality Room	0	hand-paper	red	30	3
14	Grah Shanti	Another peaceful prayer ceremony, usually done at home, to bring harmony and positive energy. It's spiritual and grounding before all the wedding madness starts.	2026-06-19	10AM - 12PM	Hilton Bayfront- Indigo Terrace	0	star	green	300	3
15	Welcome Party	Welcome celebration for out-of-town guests	2025-07-25	6:00 PM - 9:00 PM	hilton	0	🎉	blue	100	4
16	Grah Shanti	Ceremony to remove obstacles and bring peace	2025-07-25	8:00 AM - 10:00 AM	hilton	0	🕉️	purple	100	4
17	Mayra	Maternal uncle's blessing ceremony	2025-07-25	4:00 PM - 6:00 PM	hilton	0	👨‍👩‍👧‍👦	green	100	4
\.


--
-- Data for Name: guests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.guests (id, name, email, phone, side, rsvp_status, wedding_profile_id) FROM stdin;
9	Nikesh Patel			Patel	confirmed	2
18	Sahil Ahluwalia	\N	\N	Friends	Pending	3
19	Saachi Keswani	\N	\N	Friends	Pending	3
20	Alene Rose	\N	\N	Friends	Pending	3
21	Arjit Jaiswal	\N	\N	Friends	Pending	3
22	Gopika Soma	\N	\N	Friends	Pending	3
23	Parita Shah	\N	\N	Friends	Pending	3
24	Sriram Kattagarada	\N	\N	Friends	Pending	3
25	Rishabh Nair	\N	\N	Friends	Pending	3
26	Vineet Vora	\N	\N	Friends	Pending	3
27	Rikin Patel	\N	\N	Friends	Pending	3
28	Parina Patel	\N	\N	Friends	Pending	3
29	Pujan Patel	\N	\N	Friends	Pending	3
30	Nami Shah	\N	\N	Friends	Pending	3
31	Dhivan Patel	\N	\N	Friends	Pending	3
32	Devan Patel	\N	\N	Friends	Pending	3
62	Aashna Pandya			Friends	Confirmed	3
15	Simran Rijhwani			Friends	Confirmed	3
16	Rushi Thakkar			Friends	Confirmed	3
17	Mili Vazirani			Friends	Confirmed	3
33	Richa Tenany	richa.tenany@gmail.com		Tenany	Confirmed	3
34	Krishna	\N	\N	Friends	Pending	3
35	Tej Patel	\N	\N	Friends	Pending	3
36	Devika Raathore	\N	\N	Friends	Pending	3
37	Shivam Patel	\N	\N	Friends	Pending	3
38	Ruchi Patel	\N	\N	Friends	Pending	3
39	Keshu Mahesh	\N	\N	Friends	Pending	3
40	Mehul Desai	\N	\N	Friends	Pending	3
42	Shawn Sunny	\N	\N	Friends	Pending	3
44	Chandan Saini	\N	\N	Friends	Pending	3
43	Saumya Aurora			Friends	Confirmed	3
45	richa	\N	\N	richa	confirmed	4
46	nikesh	\N	\N	nikesh	confirmed	4
41	Vivek Patel			Friends	Pending	3
47	Monika Byanna	\N	\N	Friends	Pending	3
48	Priya Patel	\N	\N	Friends	Pending	3
49	Sujana Naidu	\N	\N	Friends	Pending	3
50	Aneal Dayal	\N	\N	Friends	Pending	3
51	Govind Verma	\N	\N	Friends	Pending	3
52	Aditi Mohta	\N	\N	Friends	Pending	3
53	Sunny Patel	\N	\N	Friends	Pending	3
54	Niki Patel	\N	\N	Friends	Pending	3
55	Malavika Shankar	\N	\N	Friends	Pending	3
56	Anushka Shah	\N	\N	Friends	Pending	3
57	Nandin Padheriya	\N	\N	Friends	Pending	3
58	Vishva Pandya	\N	\N	Friends	Pending	3
59	Rohan Saxena	\N	\N	Friends	Pending	3
60	Simmi Bansal	\N	\N	Friends	Pending	3
61	Suraj Tadikamala	\N	\N	Friends	Pending	3
63	Saahil Dhulla	\N	\N	Friends	Pending	3
64	Smit Desai	\N	\N	Friends	Pending	3
65	Neel Mishra	\N	\N	Friends	Pending	3
66	Neil Suvagia	\N	\N	Friends	Pending	3
67	Reeya Shah	\N	\N	Friends	Pending	3
68	Abu Balla	\N	\N	Friends	Pending	3
69	Shriya Patel	\N	\N	Friends	Pending	3
70	Priyesh Patel	\N	\N	Friends	Pending	3
71	Swathi Kari	\N	\N	Friends	Pending	3
72	Rithika Mattha	\N	\N	Friends	Pending	3
73	Pranav Agrawal	\N	\N	Friends	Pending	3
74	Neil Patel (zo)	\N	\N	Friends	Pending	3
75	Neil Patel (xi)	\N	\N	Friends	Pending	3
76	Meera Boghara	\N	\N	Friends	Pending	3
77	Sanchit Dhiman	\N	\N	Friends	Pending	3
78	Niharika Singh	\N	\N	Friends	Pending	3
79	Alaap Murali	\N	\N	Friends	Pending	3
80	Shubhit Dhar	\N	\N	Friends	Pending	3
81	Reina Patel	\N	\N	Friends	Pending	3
82	Becky Devraj	\N	\N	Friends	Pending	3
83	Sailee Karmarkar	\N	\N	Friends	Pending	3
84	Darsh Kuranna	\N	\N	Friends	Pending	3
85	Neil Patel	\N	\N	Friends	Pending	3
86	Nicky Patel	\N	\N	Friends	Pending	3
87	Kunj Shah	\N	\N	Friends	Pending	3
88	Nandini Mohta	\N	\N	Friends	Pending	3
89	Ankoor Modi	\N	\N	Friends	Pending	3
90	Richa Marathe	\N	\N	Friends	Pending	3
91	Shefali Saboo	\N	\N	Friends	Pending	3
92	Sahil Saboo	\N	\N	Friends	Pending	3
93	Swayam Suri	\N	\N	Friends	Pending	3
94	Parth Sheth	\N	\N	Friends	Pending	3
95	Parth +1	\N	\N	Friends	Pending	3
96	Nisha Panjabi	\N	\N	Friends	Pending	3
97	Akhil Chaudhari	\N	\N	Friends	Pending	3
98	Priyal Patel	\N	\N	Friends	Pending	3
99	Anika Patel	\N	\N	Friends	Pending	3
100	Dillan Patel	\N	\N	Friends	Pending	3
101	Areeba	\N	\N	Friends	Pending	3
102	Kevin Patel	\N	\N	Friends	Pending	3
103	Jayna Patel	\N	\N	Friends	Pending	3
104	Reena Patel	\N	\N	Friends	Pending	3
105	Rohit Bhatt	\N	\N	Friends	Pending	3
106	Shivani Patel	\N	\N	Friends	Pending	3
107	Bhaven Patel	\N	\N	Friends	Pending	3
108	Bhavik Patel	\N	\N	Friends	Pending	3
109	Jaivin Patel	\N	\N	Friends	Pending	3
110	Nilesh Patel	\N	\N	Patel	Confirmed	3
111	Nutan Patel	\N	\N	Patel	Confirmed	3
112	Shane Patel	\N	\N	Patel	Confirmed	3
113	Nisha Patel	\N	\N	Patel	Confirmed	3
114	Nikesh Patel	\N	\N	Patel	Confirmed	3
115	Atulbhai Patel	\N	\N	Patel	Confirmed	3
116	Ritaben Patel	\N	\N	Patel	Confirmed	3
117	Shaina Patel	\N	\N	Patel	Confirmed	3
118	Jayagauri Patel	\N	\N	Patel	Confirmed	3
119	Deepak Patel	\N	\N	Patel	Confirmed	3
120	Rajshree Patel	\N	\N	Patel	Confirmed	3
121	Dillan Patel	\N	\N	Patel	Confirmed	3
122	Priyal Patel	\N	\N	Patel	Confirmed	3
123	Areeba Nadeem	\N	\N	Patel	Confirmed	3
124	Harshadray Patel	\N	\N	Patel	Confirmed	3
125	Harshita Patel	\N	\N	Patel	Confirmed	3
126	Jaivin Patel	\N	\N	Patel	Confirmed	3
127	Anika Patel	\N	\N	Patel	Confirmed	3
128	Sarlaben Thumar	\N	\N	Patel	Confirmed	3
129	Bhikubhai Thumar	\N	\N	Patel	Confirmed	3
130	Deena Rakholia	\N	\N	Patel	Confirmed	3
131	Shivlal Rakholia	\N	\N	Patel	Confirmed	3
132	Radhika Rakholia	\N	\N	Patel	Confirmed	3
133	Meera Hasolkar	\N	\N	Patel	Confirmed	3
134	Amit Hasolkar	\N	\N	Patel	Confirmed	3
135	Arushi Hasolkar	\N	\N	Patel	Confirmed	3
136	Sanvi Hasolkar	\N	\N	Patel	Confirmed	3
137	Bhavika Bhakta	\N	\N	Patel	Confirmed	3
138	Nirav Bhakta	\N	\N	Patel	Confirmed	3
139	Arjun Bhakta	\N	\N	Patel	Confirmed	3
140	Sahana Bhakta	\N	\N	Patel	Confirmed	3
141	Bhavik Desai	\N	\N	Patel	Confirmed	3
142	Pascale Desai	\N	\N	Patel	Confirmed	3
143	Kiara Desai	\N	\N	Patel	Confirmed	3
144	Kartik Desai	\N	\N	Patel	Confirmed	3
145	Weena Desai	\N	\N	Patel	Confirmed	3
146	Bhasker Desai	\N	\N	Patel	Confirmed	3
147	Rohit Patel	\N	\N	Patel	Confirmed	3
148	Divya Patel	\N	\N	Patel	Confirmed	3
149	Ankit Babariya	\N	\N	Patel	Confirmed	3
150	Hardika Babariya	\N	\N	Patel	Confirmed	3
151	Manish Patel	\N	\N	Patel	Confirmed	3
152	Bhavna Patel	\N	\N	Patel	Confirmed	3
153	Kevin Patel	\N	\N	Patel	Confirmed	3
154	Jayna Patel	\N	\N	Patel	Confirmed	3
155	Reena Patel	\N	\N	Patel	Confirmed	3
156	Rohit Bhatt	\N	\N	Patel	Confirmed	3
157	Nayna Saparia	\N	\N	Patel	Confirmed	3
158	Harshad Saparia	\N	\N	Patel	Confirmed	3
159	Swati Sood	\N	\N	Patel	Confirmed	3
160	Saket Sood	\N	\N	Patel	Confirmed	3
161	Shalin Sood	\N	\N	Patel	Confirmed	3
162	Shaan Sood	\N	\N	Patel	Confirmed	3
163	Tina Kapadia	\N	\N	Patel	Confirmed	3
164	Niraj Kapadia	\N	\N	Patel	Confirmed	3
165	Ayan Kapadia	\N	\N	Patel	Confirmed	3
166	Asha Kapadia	\N	\N	Patel	Confirmed	3
167	Rekha Patel	\N	\N	Patel	Confirmed	3
168	Dilip Patel	\N	\N	Patel	Confirmed	3
169	Neil Patel	\N	\N	Patel	Confirmed	3
170	Trusha Patel	\N	\N	Patel	Confirmed	3
171	Dillon Patel	\N	\N	Patel	Confirmed	3
172	Priya Weise	\N	\N	Patel	Confirmed	3
173	Brian Weise	\N	\N	Patel	Confirmed	3
174	Ethan Weise	\N	\N	Patel	Confirmed	3
175	Aiden Weise	\N	\N	Patel	Confirmed	3
176	Nolan Weise	\N	\N	Patel	Confirmed	3
177	Varsha Samji	\N	\N	Patel	Confirmed	3
178	Suresh Samji	\N	\N	Patel	Confirmed	3
179	Sanjana Samji	\N	\N	Patel	Confirmed	3
180	Anita Patel	\N	\N	Patel	Confirmed	3
181	Bharat Patel	\N	\N	Patel	Confirmed	3
182	Bhavik Patel	\N	\N	Patel	Confirmed	3
183	Bhaven Patel	\N	\N	Patel	Confirmed	3
184	Shivani Patel	\N	\N	Patel	Confirmed	3
185	Sundip Patel	\N	\N	Patel	Confirmed	3
186	Salina Patel	\N	\N	Patel	Confirmed	3
187	Hiren Patel	\N	\N	Patel	Confirmed	3
188	Neal Patel	\N	\N	Patel	Confirmed	3
189	Bina Mehta	\N	\N	Patel	Confirmed	3
190	Kiyasha Mehta	\N	\N	Patel	Confirmed	3
191	Rikesh Mehta	\N	\N	Patel	Confirmed	3
192	Misha	\N	\N	Patel	Confirmed	3
193	Sameer Shah	\N	\N	Patel	Confirmed	3
194	Jigna Shah	\N	\N	Patel	Confirmed	3
195	Sangita Shah	\N	\N	Patel	Confirmed	3
196	Dilip Shah	\N	\N	Patel	Confirmed	3
197	Rupal Shah	\N	\N	Patel	Confirmed	3
198	Prashant Shah	\N	\N	Patel	Confirmed	3
199	Jyotin Shah	\N	\N	Patel	Confirmed	3
200	Krishna Shah	\N	\N	Patel	Confirmed	3
201	Trupti Shah	\N	\N	Patel	Confirmed	3
202	Parimal Shah	\N	\N	Patel	Confirmed	3
203	Jigna Shah	\N	\N	Patel	Confirmed	3
204	Rajesh Shah	\N	\N	Patel	Confirmed	3
205	Saumil Shah	\N	\N	Patel	Confirmed	3
206	Phalguni Shah	\N	\N	Patel	Confirmed	3
207	Vikram Talati	\N	\N	Patel	Confirmed	3
208	Alka Talati	\N	\N	Patel	Confirmed	3
209	Sanjeev Mervana	\N	\N	Patel	Confirmed	3
210	Mruduta Mervana	\N	\N	Patel	Confirmed	3
211	Hemant Patel	\N	\N	Patel	Confirmed	3
212	Birava Patel	\N	\N	Patel	Confirmed	3
213	Jigna Patel	\N	\N	Patel	Confirmed	3
214	Amit Patel	\N	\N	Patel	Confirmed	3
215	Roopa Patel	\N	\N	Patel	Confirmed	3
216	Harshal Patel	\N	\N	Patel	Confirmed	3
217	Jignesh Shah	\N	\N	Patel	Confirmed	3
218	Payal Shah	\N	\N	Patel	Confirmed	3
219	Divyang Patel	\N	\N	Patel	Confirmed	3
220	Rupal Patel	\N	\N	Patel	Confirmed	3
221	Vaishali Gandhi	\N	\N	Patel	Confirmed	3
222	Paresh Gandhi	\N	\N	Patel	Confirmed	3
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, title, description, category, status, assigned_to, due_date, event_id, wedding_profile_id) FROM stdin;
1	Book wedding venue	Find and book the perfect venue	venue	done	bride	2024-11-15	\N	\N
6	Book Photographer	Look through photographers listed below and finalize : \n@lex\n@wynn \n@ballerinafilms	photography	done	bride	2025-07-18	\N	\N
8	Wedding Website	Make the wedding website	invitations	todo	bride		\N	\N
5	Book catering service	Hire catering company	food	todo	parents	2024-10-01	\N	\N
9	Book decorator	Hire decoration service	decor	todo	bride		\N	\N
11	Book wedding venue	Reserve main ceremony venue	venue	done	bride		\N	3
12	Book decorator	Hire decoration service	decor	inprogress	bride		\N	3
15	Book wedding photographer	Hire photographer service	photography	done	bride		\N	3
16	Book videographer	Hire videography service	photography	done	bride		\N	3
17	Book live band/DJ	Hire entertainment service	music	done	bride		\N	3
13	Book catering service	Hire catering company	food	todo	parents		\N	3
14	Design wedding website	Create online wedding info	invitations	todo	groom		\N	3
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, role, name, wedding_profile_id) FROM stdin;
2	sarah.johnson	password123	bride	Sarah Johnson	2
4	nikeshpatel	richa01	bride	nikesh patel	4
3	richatenany	$2b$12$okDzvKfV4eM6E4cEqNfU4eWtKjkMKJX7Y1OABLuMnxx7N7EwhOC6u	bride	Richa Tenany	3
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendors (id, name, category, contact, email, phone, address, website, contract_url, notes, wedding_profile_id, total_price, security_deposit, paid_by) FROM stdin;
1	Amber Rain Photography	photography	Amber Rain	amberrain07@gmail.com	6262627853			contracts/Photography Contract.pdf	21.5 hours of photo coverage	3	8800	600	bride
2	Events By Sep	planning	Sepali Vakil	eventsbysep@gmail.com	4402812862			contracts/Wedding Planner Contract.pdf		3	8250	5775	bride
5	Drea	makeup			3104082544					3	7760	500	bride
\.


--
-- Data for Name: wedding_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wedding_profiles (id, bride_name, groom_name, wedding_start_date, wedding_end_date, venue, city, state, guest_count, budget, functions, created_at, is_complete) FROM stdin;
3	Richa Tenany	Nikesh Patel	2026-06-18	2026-06-21	Hilton Bayfront	San Diego	California	300	300000	{ganesh-puja,welcome-party,haldi,sangeet,wedding,reception}	2025-07-17 04:59:42.365079	t
2	Richa Tenany	Nikesh Patel	2024-12-20	2024-12-22	Grand Oak Resort	Napa Valley	California	200	75000	{ganesh-puja,haldi,sangeet,wedding,reception}	2025-07-17 04:53:30.2405	t
4	richa	nikesh	2025-07-25	2025-07-31	Hilton Bayfront 	San Diego	California	300	100000	{welcome-party,grah-shanti,mayra}	2025-07-17 20:36:39.110387	t
\.


--
-- Name: budget_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.budget_items_id_seq', 10, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 17, true);


--
-- Name: guests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.guests_id_seq', 222, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tasks_id_seq', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vendors_id_seq', 5, true);


--
-- Name: wedding_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wedding_profiles_id_seq', 4, true);


--
-- Name: budget_items budget_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: wedding_profiles wedding_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_profiles
    ADD CONSTRAINT wedding_profiles_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

