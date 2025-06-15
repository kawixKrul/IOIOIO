--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: wiktor
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO wiktor;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: wiktor
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activation_tokens; Type: TABLE; Schema: public; Owner: wiktor
--

CREATE TABLE public.activation_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.activation_tokens OWNER TO wiktor;

--
-- Name: activation_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: wiktor
--

CREATE SEQUENCE public.activation_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activation_tokens_id_seq OWNER TO wiktor;

--
-- Name: activation_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wiktor
--

ALTER SEQUENCE public.activation_tokens_id_seq OWNED BY public.activation_tokens.id;


--
-- Name: admins; Type: TABLE; Schema: public; Owner: wiktor
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.admins OWNER TO wiktor;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: wiktor
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admins_id_seq OWNER TO wiktor;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wiktor
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: applications; Type: TABLE; Schema: public; Owner: wiktor
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    "Student_ID" integer NOT NULL,
    "Promoter_ID" integer NOT NULL,
    "Topic_ID" integer NOT NULL,
    "Description" text NOT NULL,
    "Status" integer NOT NULL,
    "ConfirmationToken" character varying(64)
);


ALTER TABLE public.applications OWNER TO wiktor;

--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: wiktor
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.applications_id_seq OWNER TO wiktor;

--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wiktor
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: wiktor
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    user_agent character varying(512),
    ip_address character varying(45)
);


ALTER TABLE public.sessions OWNER TO wiktor;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: wiktor
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_id_seq OWNER TO wiktor;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wiktor
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: wiktor
--

CREATE TABLE public.students (
    id integer NOT NULL,
    user_id integer NOT NULL,
    id_chosen_topic integer
);


ALTER TABLE public.students OWNER TO wiktor;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: wiktor
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.students_id_seq OWNER TO wiktor;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wiktor
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: supervisors; Type: TABLE; Schema: public; Owner: wiktor
--

CREATE TABLE public.supervisors (
    id integer NOT NULL,
    user_id integer NOT NULL,
    expertise_field character varying(250) NOT NULL
);


ALTER TABLE public.supervisors OWNER TO wiktor;

--
-- Name: supervisors_id_seq; Type: SEQUENCE; Schema: public; Owner: wiktor
--

CREATE SEQUENCE public.supervisors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.supervisors_id_seq OWNER TO wiktor;

--
-- Name: supervisors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wiktor
--

ALTER SEQUENCE public.supervisors_id_seq OWNED BY public.supervisors.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: wiktor
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    "Name" character varying(30) NOT NULL,
    "Thesis_ID" integer,
    "Topic_ID" integer
);


ALTER TABLE public.tags OWNER TO wiktor;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: wiktor
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_id_seq OWNER TO wiktor;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wiktor
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: theses; Type: TABLE; Schema: public; Owner: wiktor
--

CREATE TABLE public.theses (
    id integer NOT NULL,
    "Title" character varying(50) NOT NULL,
    "Author" character varying(30) NOT NULL,
    "Description" character varying(250) NOT NULL,
    pdf text NOT NULL,
    "Tags_list" text NOT NULL,
    "Supervisor_ID" integer NOT NULL
);


ALTER TABLE public.theses OWNER TO wiktor;

--
-- Name: theses_id_seq; Type: SEQUENCE; Schema: public; Owner: wiktor
--

CREATE SEQUENCE public.theses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.theses_id_seq OWNER TO wiktor;

--
-- Name: theses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wiktor
--

ALTER SEQUENCE public.theses_id_seq OWNED BY public.theses.id;


--
-- Name: theses_topics; Type: TABLE; Schema: public; Owner: wiktor
--

CREATE TABLE public.theses_topics (
    id integer NOT NULL,
    "Promoter_ID" integer NOT NULL,
    "Title" character varying(100) NOT NULL,
    "Description" character varying(250) NOT NULL,
    "Degree_level" character varying(50) NOT NULL,
    "Available_slots" integer NOT NULL,
    "Tags_list" text NOT NULL
);


ALTER TABLE public.theses_topics OWNER TO wiktor;

--
-- Name: theses_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: wiktor
--

CREATE SEQUENCE public.theses_topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.theses_topics_id_seq OWNER TO wiktor;

--
-- Name: theses_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wiktor
--

ALTER SEQUENCE public.theses_topics_id_seq OWNED BY public.theses_topics.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: wiktor
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone NOT NULL,
    role character varying(50) NOT NULL,
    name character varying(50) NOT NULL,
    surname character varying(50) NOT NULL
);


ALTER TABLE public.users OWNER TO wiktor;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: wiktor
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO wiktor;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wiktor
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activation_tokens id; Type: DEFAULT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.activation_tokens ALTER COLUMN id SET DEFAULT nextval('public.activation_tokens_id_seq'::regclass);


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: supervisors id; Type: DEFAULT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.supervisors ALTER COLUMN id SET DEFAULT nextval('public.supervisors_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: theses id; Type: DEFAULT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.theses ALTER COLUMN id SET DEFAULT nextval('public.theses_id_seq'::regclass);


--
-- Name: theses_topics id; Type: DEFAULT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.theses_topics ALTER COLUMN id SET DEFAULT nextval('public.theses_topics_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activation_tokens; Type: TABLE DATA; Schema: public; Owner: wiktor
--

COPY public.activation_tokens (id, user_id, token, expires_at) FROM stdin;
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: wiktor
--

COPY public.admins (id, user_id) FROM stdin;
1	1
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: wiktor
--

COPY public.applications (id, "Student_ID", "Promoter_ID", "Topic_ID", "Description", "Status", "ConfirmationToken") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: wiktor
--

COPY public.sessions (id, user_id, token, created_at, expires_at, user_agent, ip_address) FROM stdin;
1	2	576f4bc7-0623-49f4-90a3-d0dabb41f60a	2025-05-22 17:49:19.636212	2025-05-29 17:49:19.636212	PostmanRuntime/7.44.0	ip6-localhost
2	16	20d0c397-a85b-498b-ba01-1ea4218d1c8f	2025-05-22 17:49:24.915031	2025-05-29 17:49:24.915031	PostmanRuntime/7.44.0	ip6-localhost
3	46	1f7e0c94-a0b9-4d0e-976a-e24991f11358	2025-05-22 17:52:50.400326	2025-05-29 17:52:50.400326	PostmanRuntime/7.44.0	ip6-localhost
4	2	f7aa2b79-5003-46fd-b7d8-061f1bcb5c1f	2025-05-22 17:53:16.635521	2025-05-29 17:53:16.635521	PostmanRuntime/7.44.0	ip6-localhost
5	32	72e3548f-8343-4883-8658-b3b65c81bfe3	2025-05-22 17:57:55.529143	2025-05-29 17:57:55.529143	PostmanRuntime/7.44.0	ip6-localhost
6	32	ca32efa9-c6dc-4aff-a6e2-78db4958ebe8	2025-05-22 17:58:27.577686	2025-05-29 17:58:27.577686	PostmanRuntime/7.44.0	ip6-localhost
7	32	77e8dd68-ddfb-40eb-a43f-79826939f3c1	2025-05-22 18:02:12.77318	2025-05-29 18:02:12.77318	PostmanRuntime/7.44.0	ip6-localhost
8	2	09348db8-431e-49f6-bbf2-014fc6b0dba3	2025-05-22 18:04:12.180039	2025-05-29 18:04:12.180039	PostmanRuntime/7.44.0	ip6-localhost
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: wiktor
--

COPY public.students (id, user_id, id_chosen_topic) FROM stdin;
1	2	\N
2	3	\N
3	4	\N
4	5	\N
5	6	\N
6	7	\N
7	8	\N
8	9	\N
9	10	\N
10	11	\N
11	12	\N
12	13	\N
13	14	\N
14	15	\N
15	16	\N
16	17	\N
17	18	\N
18	19	\N
19	20	\N
20	21	\N
21	22	\N
22	23	\N
23	24	\N
24	25	\N
25	26	\N
26	27	\N
27	28	\N
28	29	\N
29	30	\N
30	31	\N
\.


--
-- Data for Name: supervisors; Type: TABLE DATA; Schema: public; Owner: wiktor
--

COPY public.supervisors (id, user_id, expertise_field) FROM stdin;
1	32	Informatyka
2	33	Informatyka
3	34	Informatyka
4	35	Informatyka
5	36	Informatyka
6	37	Informatyka
7	38	Informatyka
8	39	Informatyka
9	40	Informatyka
10	41	Informatyka
11	42	Informatyka
12	43	Informatyka
13	44	Informatyka
14	45	Informatyka
15	46	Informatyka
16	47	Informatyka
17	48	Informatyka
18	49	Informatyka
19	50	Informatyka
20	51	Informatyka
21	52	Informatyka
22	53	Informatyka
23	54	Informatyka
24	55	Informatyka
25	56	Informatyka
26	57	Informatyka
27	58	Informatyka
28	59	Informatyka
29	60	Informatyka
30	61	Informatyka
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: wiktor
--

COPY public.tags (id, "Name", "Thesis_ID", "Topic_ID") FROM stdin;
\.


--
-- Data for Name: theses; Type: TABLE DATA; Schema: public; Owner: wiktor
--

COPY public.theses (id, "Title", "Author", "Description", pdf, "Tags_list", "Supervisor_ID") FROM stdin;
\.


--
-- Data for Name: theses_topics; Type: TABLE DATA; Schema: public; Owner: wiktor
--

COPY public.theses_topics (id, "Promoter_ID", "Title", "Description", "Degree_level", "Available_slots", "Tags_list") FROM stdin;
1	5	Zastosowanie sieci neuronowych do detekcji oszustw finansowych	Projekt i implementacja modelu uczenia maszynowego do wykrywania anomalii w danych transakcyjnych.	MSc	2	AI, Machine Learning, Finance, Fraud Detection
2	20	Projektowanie energooszczędnego domu pasywnego	Analiza i projekt koncepcyjny budynku spełniającego kryteria standardu pasywnego, z uwzględnieniem klimatu Polski.	BSc	3	Architecture, Sustainable Design, Energy Efficiency, Civil Engineering
3	30	Aplikacja mobilna wspierająca naukę języka migowego	Stworzenie aplikacji edukacyjnej do nauki polskiego języka migowego z użyciem animacji 3D.	BSc	1	Mobile Development, Education Technology, Sign Language, 3D Animation
4	8	Modelowanie dynamiki populacji wilka szarego w Polsce	Budowa matematycznego modelu populacyjnego i symulacja wpływu zmian środowiskowych na liczebność gatunku.	MSc	2	Ecology, Mathematical Modeling, Wildlife Conservation, Population Dynamics
5	2	System rozpoznawania twarzy oparty na Raspberry Pi	Budowa prototypowego systemu rozpoznawania twarzy z użyciem kamerki i Raspberry Pi do zastosowań domowych.	BSc	4	Embedded Systems, Face Recognition, IoT, Computer Vision
6	27	Wpływ zmian klimatycznych na produkcję wina w Europie	Analiza danych klimatycznych i prognoz dotyczących przyszłości upraw winorośli w głównych regionach Europy.	MSc	2	Climate Change, Agriculture, Data Analysis, Geography
7	18	Zastosowanie blockchain w zarządzaniu dokumentacją medyczną	Projekt systemu bezpiecznego przechowywania i udostępniania dokumentacji pacjenta z wykorzystaniem technologii blockchain.	MSc	3	Blockchain, Healthcare IT, Cybersecurity, Data Privacy
8	23	Analiza struktury rytmicznej w muzyce jazzowej z użyciem algorytmów AI	Zastosowanie metod sztucznej inteligencji do analizy rytmiki i improwizacji w nagraniach jazzowych.	MSc	1	Artificial Intelligence, Music Theory, Signal Processing, Jazz
9	2	Optymalizacja procesów logistycznych z wykorzystaniem symulacji komputerowej	Modelowanie i optymalizacja procesu zarządzania magazynem z użyciem symulacji dyskretnej.	BSc	4	Logistics, Operations Research, Simulation, Supply Chain Management
10	19	Opracowanie aplikacji webowej wspierającej planowanie diety wegańskiej	Stworzenie platformy online umożliwiającej personalizację jadłospisu wegańskiego na podstawie danych zdrowotnych.	BSc	2	Web Development, Nutrition, HealthTech, User Personalization
11	26	Symulacja rozprzestrzeniania się wirusów w sieciach społecznościowych	Modelowanie i analiza zjawisk epidemiologicznych w grafach społecznych z użyciem teorii grafów i symulacji Monte Carlo.	MSc	2	Graph Theory, Epidemiology, Mathematical Modeling, Simulation
12	29	System rekomendacji filmów oparty na filtracji kolaboracyjnej	Implementacja systemu rekomendującego treści multimedialne przy użyciu metod uczenia maszynowego.	BSc	3	Machine Learning, Recommendation Systems, Python, Data Science
13	28	Wykorzystanie algorytmów genetycznych do optymalizacji tras dostaw	Projekt i implementacja heurystycznego algorytmu rozwiązującego problem komiwojażera z ograniczeniami.	MSc	2	Optimization, Genetic Algorithms, Operations Research, TSP
14	3	Wizualizacja danych przestrzennych przy użyciu D3.js i Mapbox	Stworzenie interaktywnego dashboardu do analizy danych geolokalizacyjnych.	BSc	4	Data Visualization, Web Development, GIS, D3.js
15	25	Zastosowanie PCA i klasteryzacji w analizie danych genetycznych	Analiza wielowymiarowa danych biologicznych z użyciem redukcji wymiarów i algorytmów nienadzorowanych.	MSc	1	PCA, Clustering, Bioinformatics, Data Mining
16	28	Rozpoznawanie emocji w tekstach z wykorzystaniem NLP	Budowa modelu klasyfikującego emocje w wiadomościach tekstowych i postach społecznościowych.	MSc	2	NLP, Sentiment Analysis, Deep Learning, Emotion Recognition
17	27	Analiza efektywności algorytmów sortowania na dużych zbiorach danych	Porównanie wybranych algorytmów sortowania pod kątem czasu działania i zużycia pamięci.	BSc	3	Algorithms, Data Structures, Benchmarking, Performance
18	16	Budowa własnego kompilatora dla języka mini-Python	Implementacja analizatora leksykalnego, parsera i generatora kodu dla uproszczonego języka skryptowego.	MSc	1	Compiler Design, Programming Languages, Formal Grammars, Lex/Yacc
19	16	System do generowania grafik fraktalnych w czasie rzeczywistym	Stworzenie aplikacji umożliwiającej wizualizację fraktali Mandelbrota i Julii z wykorzystaniem GPU.	BSc	2	Fractals, Computer Graphics, OpenGL, Mathematics
20	30	Automatyczna detekcja plagiatu w dokumentach tekstowych	System porównujący dokumenty z wykorzystaniem n-gramów i miar podobieństwa tekstów.	MSc	2	Text Mining, Plagiarism Detection, Natural Language Processing, Similarity Measures
21	2	Model predykcyjny zużycia energii w budynkach inteligentnych	Zastosowanie regresji i sieci neuronowych do prognozowania zapotrzebowania energetycznego.	MSc	3	Time Series, Machine Learning, Smart Buildings, Energy Forecasting
22	11	Projekt i analiza sieci neuronowej uczącej się gry w szachy	Budowa sieci uczącej się strategii szachowych na podstawie partii mistrzowskich.	MSc	1	AI, Chess, Deep Learning, Reinforcement Learning
23	9	Zastosowanie algebry liniowej w kompresji obrazu	Implementacja kompresji obrazów z wykorzystaniem SVD i transformacji kosinusowej.	BSc	2	Linear Algebra, Image Processing, SVD, DCT
24	21	System detekcji botów w serwisie e-commerce	Budowa modelu klasyfikującego użytkowników jako ludzi lub boty na podstawie zachowania.	MSc	2	Cybersecurity, Bot Detection, Behavioral Analysis, Machine Learning
25	26	Tworzenie i rozwiązywanie łamigłówek sudoku za pomocą CSP	Implementacja solwera i generatora sudoku z użyciem technik programowania z ograniczeniami.	BSc	3	Constraint Programming, AI, Puzzles, Backtracking
26	19	Zastosowanie matematyki dyskretnej w kryptografii klucza publicznego	Analiza algorytmów RSA i ECC w kontekście teorii liczb i złożoności obliczeniowej.	MSc	1	Cryptography, Number Theory, Discrete Math, Security
27	15	Analiza sentymentu w recenzjach produktów za pomocą transformers	Użycie modeli typu BERT do klasyfikacji emocji w recenzjach z portali zakupowych.	MSc	2	Transformers, BERT, Sentiment Analysis, NLP
28	18	Symulator kolejek wielostanowiskowych z wizualizacją	Budowa programu do symulacji systemów kolejkowych z graficznym interfejsem użytkownika.	BSc	4	Queuing Theory, Simulation, GUI, Discrete Events
29	7	Zastosowanie teorii chaosu w analizie rynków finansowych	Identyfikacja nieliniowych wzorców i bifurkacji w danych giełdowych.	MSc	1	Chaos Theory, Financial Markets, Time Series, Nonlinear Dynamics
30	16	Projektowanie i testowanie algorytmów szyfrowania danych w aplikacjach mobilnych	Budowa bezpiecznego systemu przechowywania danych w aplikacji mobilnej z wykorzystaniem AES i RSA.	BSc	3	Encryption, Mobile Development, Data Security, Cryptography
31	24	Analiza algorytmów sortowania w dużych zbiorach danych	Porównanie efektywności klasycznych i nowoczesnych algorytmów sortowania na dużych datasetach.	BSc	3	Algorithms, Data Structures, Big Data, Optimization
32	21	Uczenie maszynowe w predykcji zachowań użytkowników	Zastosowanie metod ML do przewidywania zachowań i preferencji użytkowników w aplikacjach mobilnych.	MSc	2	Machine Learning, User Behavior, Mobile Apps, Data Science
33	23	Optymalizacja zapytań w bazach danych NoSQL	Badanie technik przyspieszających wykonywanie zapytań w popularnych bazach NoSQL.	MSc	1	NoSQL, Databases, Query Optimization, Performance
34	11	Zastosowanie grafów w analizie sieci społecznościowych	Modelowanie i analiza sieci społecznościowych za pomocą struktur grafowych.	BSc	4	Graph Theory, Social Networks, Data Analysis, Network Science
35	21	Kryptografia kwantowa i jej wpływ na bezpieczeństwo danych	Przegląd technologii kryptografii kwantowej i analiza jej zastosowań w bezpieczeństwie informacji.	MSc	2	Quantum Cryptography, Security, Encryption, Information Technology
36	27	Implementacja systemu rekomendacji filmów na podstawie analizy sentymentu	Budowa rekomendatora filmów wykorzystującego analizę opinii i recenzji użytkowników.	MSc	3	Recommender Systems, Sentiment Analysis, NLP, Python
37	8	Modelowanie ryzyka kredytowego przy użyciu sieci neuronowych	Zastosowanie deep learningu do przewidywania ryzyka niewypłacalności klientów banku.	MSc	2	Neural Networks, Finance, Risk Analysis, Deep Learning
38	24	Teoria grafów w optymalizacji tras dostawczych	Zastosowanie algorytmów grafowych do optymalizacji tras w logistyce i transporcie.	BSc	3	Graph Theory, Optimization, Logistics, Operations Research
39	17	Analiza danych sensorowych w systemach IoT	Przetwarzanie i analiza danych pochodzących z urządzeń IoT w czasie rzeczywistym.	MSc	2	IoT, Data Analysis, Real-Time Systems, Sensors
40	10	Wykorzystanie algorytmów genetycznych w optymalizacji funkcji	Badanie efektywności algorytmów genetycznych w rozwiązywaniu problemów optymalizacyjnych.	MSc	1	Genetic Algorithms, Optimization, Artificial Intelligence, Mathematics
41	23	Bezpieczeństwo aplikacji webowych – analiza podatności	Identyfikacja i przeciwdziałanie najczęstszym zagrożeniom w aplikacjach internetowych.	BSc	4	Web Security, Vulnerabilities, Penetration Testing, Cybersecurity
42	14	Analiza big data w medycynie – wykrywanie chorób na podstawie danych	Zastosowanie technik big data i ML do diagnostyki i prognozowania chorób.	MSc	3	Big Data, Healthcare, Machine Learning, Data Mining
43	8	Symulacje numeryczne w matematyce stosowanej	Tworzenie symulacji komputerowych rozwiązań równań różniczkowych.	BSc	2	Numerical Simulation, Applied Mathematics, Differential Equations, Modeling
44	3	Automatyczne rozpoznawanie obrazów medycznych	Budowa systemu do analizy i klasyfikacji obrazów diagnostycznych z wykorzystaniem ML.	MSc	3	Image Recognition, Medical Imaging, Machine Learning, Computer Vision
45	11	Analiza danych w finansach – wykrywanie anomalii transakcyjnych	Wykorzystanie metod statystycznych i ML do detekcji oszustw finansowych.	MSc	2	Finance, Anomaly Detection, Machine Learning, Statistics
46	15	Teoria grafów i jej zastosowanie w bioinformatyce	Analiza sieci biologicznych i genomowych z wykorzystaniem teorii grafów.	BSc	1	Graph Theory, Bioinformatics, Networks, Computational Biology
47	18	Przetwarzanie języka naturalnego w chatbotach	Tworzenie inteligentnych chatbotów wykorzystujących NLP i uczenie maszynowe.	MSc	3	NLP, Chatbots, Machine Learning, Artificial Intelligence
48	13	Analiza i wizualizacja danych geograficznych	Techniki analizy przestrzennej i wizualizacji danych GIS.	BSc	2	GIS, Data Visualization, Spatial Analysis, Geoinformatics
49	25	Algorytmy kompresji danych multimedialnych	Badanie i implementacja efektywnych metod kompresji obrazów i wideo.	MSc	2	Data Compression, Multimedia, Algorithms, Signal Processing
50	26	Modelowanie procesów biznesowych z wykorzystaniem BPMN	Tworzenie i optymalizacja modeli procesów biznesowych przy pomocy BPMN.	BSc	3	Business Process Modeling, BPMN, Optimization, Information Systems
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: wiktor
--

COPY public.users (id, email, password_hash, is_active, created_at, role, name, surname) FROM stdin;
1	admin@agh.edu.pl	$2a$12$UOZVI6IeM2Jb6pJRbmo6DOY9Q/EGp.kkd9k0Gtea5lNt..9AUffxK	t	2025-05-22 17:49:06.568581	admin	Super	Admin
2	kowalski1@student.agh.edu.pl	$2b$12$sRLsI1twTvuGH9HJc6vGTOCw/gQ1HCrFnoplqva5TqAYtEQBC4yka	t	2025-05-22 17:48:43.470173	student	Jan1	Kowalski1
3	kowalski2@student.agh.edu.pl	$2b$12$umDUUAkQVBEEKJuHJiioFuG1f0MpG3rUfqF77vn169AIQrmGTB20G	t	2025-05-22 17:48:43.470173	student	Jan2	Kowalski2
4	kowalski3@student.agh.edu.pl	$2b$12$CkdVkarNJRVfTsqftskFOOPbEMJrEj2/cvNn29TODJecK9djGG6im	t	2025-05-22 17:48:43.470173	student	Jan3	Kowalski3
5	kowalski4@student.agh.edu.pl	$2b$12$GetIcXjFoSyfPmItmnaWu.cVw75Mc5lwQHYKKgisMAkMiLMluolmi	t	2025-05-22 17:48:43.470173	student	Jan4	Kowalski4
6	kowalski5@student.agh.edu.pl	$2b$12$LDyCgqm0/2zJjjMZK/Zq2u2xgOqu/S3Z1B7Q2MI3ZMvUEaKd5kDTG	t	2025-05-22 17:48:43.470173	student	Jan5	Kowalski5
7	kowalski6@student.agh.edu.pl	$2b$12$OqJT5bW6jnZF8J1voFrvC.cLCtYb8AgGaC9guP06IHFkjiTystQRa	t	2025-05-22 17:48:43.470173	student	Jan6	Kowalski6
8	kowalski7@student.agh.edu.pl	$2b$12$hpg1fySjkLLGa34NJiBRLuoo3Im.dwfwgp4gSIxMZrNTTY59oPEoq	t	2025-05-22 17:48:43.470173	student	Jan7	Kowalski7
9	kowalski8@student.agh.edu.pl	$2b$12$iwLL/HbvVJYfajuEEwiA2enCledH0pJJzMcwqoN8X.lRa912GfG.6	t	2025-05-22 17:48:43.470173	student	Jan8	Kowalski8
10	kowalski9@student.agh.edu.pl	$2b$12$FH0cmu36tun7hihOaUoVpOLYNjIJM5T/7UBCZBCENV.UoLWBxOtTW	t	2025-05-22 17:48:43.470173	student	Jan9	Kowalski9
11	kowalski10@student.agh.edu.pl	$2b$12$wBiKLEO7Wt//neNehTGuj.ndKbsTeTUjRv6aMmAh/01E7bMWtXNEm	t	2025-05-22 17:48:43.470173	student	Jan10	Kowalski10
12	kowalski11@student.agh.edu.pl	$2b$12$knJt2200xL7tDQC2piqKHOajMiyKG6Y2vTZqbIAA87Z9Zphqqf/Ym	t	2025-05-22 17:48:43.470173	student	Jan11	Kowalski11
13	kowalski12@student.agh.edu.pl	$2b$12$wyqlsLCYbqZAX0l/6uScneJlkmF4FlBrusd2YuvdKbbBcXnyPXq2a	t	2025-05-22 17:48:43.470173	student	Jan12	Kowalski12
14	kowalski13@student.agh.edu.pl	$2b$12$fr6q3qh9FgTYdjKwc8cD/enwvkQXIBJbiQMoPsco1sM6Gh1xqoZfi	t	2025-05-22 17:48:43.470173	student	Jan13	Kowalski13
15	kowalski14@student.agh.edu.pl	$2b$12$faBGjdxiNzj2oqvwTmUh7.kP1nfxmWvr2MvvQbW1OV39VXAVO67Nq	t	2025-05-22 17:48:43.470173	student	Jan14	Kowalski14
16	kowalski15@student.agh.edu.pl	$2b$12$L5n4xDZVo2d/7jRBlukz5eZKi9kvm6DWVPQwIFS443AcjEQTYJ6yW	t	2025-05-22 17:48:43.470173	student	Jan15	Kowalski15
17	kowalski16@student.agh.edu.pl	$2b$12$WFKF/nrzMNgVTTft//Q77u5eTk2elSfMjSNkmHXuPCYRl/gQvBhjq	t	2025-05-22 17:48:43.470173	student	Jan16	Kowalski16
18	kowalski17@student.agh.edu.pl	$2b$12$znL4y1LAoLdUVtog/3eQLulV/ZCM1zqAlGOw3UzXSXaQRYM2AQiyG	t	2025-05-22 17:48:43.470173	student	Jan17	Kowalski17
19	kowalski18@student.agh.edu.pl	$2b$12$q8ULBbJxfMDv1effavCCzuRDZddfVBvH9arXoQzHIWN6itTiYaX8.	t	2025-05-22 17:48:43.470173	student	Jan18	Kowalski18
20	kowalski19@student.agh.edu.pl	$2b$12$Ru0Tz1scQAaMcKFC89cEYuNQooq92Cs.8Ps2E13pmbrqIzuVMxeOi	t	2025-05-22 17:48:43.470173	student	Jan19	Kowalski19
21	kowalski20@student.agh.edu.pl	$2b$12$T0oe42qwXuu/KNri6rDuOuDukaEWdGIPJ3.J/SCfdF2Zx0dWeSy7y	t	2025-05-22 17:48:43.470173	student	Jan20	Kowalski20
22	kowalski21@student.agh.edu.pl	$2b$12$o0UOaHvCxUPr6OSwKgWpBOmY3OpzlhDkfD9Z31LxPbl/v75pf910u	t	2025-05-22 17:48:43.470173	student	Jan21	Kowalski21
23	kowalski22@student.agh.edu.pl	$2b$12$5VznP86NaxbyfSf/JMlgXOwgeADReFoyIlICDY6SvHRjVJAl.mAfC	t	2025-05-22 17:48:43.470173	student	Jan22	Kowalski22
24	kowalski23@student.agh.edu.pl	$2b$12$w4hoYTBSPGH9hmjhVDKwS.WEQqUdFf5iSoMbah7hpI6JBIaoqHXcC	t	2025-05-22 17:48:43.470173	student	Jan23	Kowalski23
25	kowalski24@student.agh.edu.pl	$2b$12$1YxaaW9wtnwZ5N/dxmO0Nu7hvSP4bGrmque.i/kgwMus1xa9ZeBuW	t	2025-05-22 17:48:43.470173	student	Jan24	Kowalski24
26	kowalski25@student.agh.edu.pl	$2b$12$WddM7e0BNrGhyOaCS6K4gOYF.ajloJaKRGBToAbpbxJoPHpUBhgJO	t	2025-05-22 17:48:43.470173	student	Jan25	Kowalski25
27	kowalski26@student.agh.edu.pl	$2b$12$K/EXaKU.cKAxmabnVS9dD.jm8zk6ZyhGb2PBI9yW6p2FxIQkUwQIy	t	2025-05-22 17:48:43.470173	student	Jan26	Kowalski26
28	kowalski27@student.agh.edu.pl	$2b$12$aThCibXWd6.EYjXvrLsWjuMkAyYS4Og9QbxrccVtuQA5vnRqC1bDy	t	2025-05-22 17:48:43.470173	student	Jan27	Kowalski27
29	kowalski28@student.agh.edu.pl	$2b$12$Uw1ULa/G2JFKBLGbRiInwOl0lMFmXT63OZcPd/bgG9iA.DiRkz2La	t	2025-05-22 17:48:43.470173	student	Jan28	Kowalski28
30	kowalski29@student.agh.edu.pl	$2b$12$ME3/91YNj5b1pwvn155O7.h4po0.OYMdo1hiU4I/CaWZGgDaXYdKS	t	2025-05-22 17:48:43.470173	student	Jan29	Kowalski29
31	kowalski30@student.agh.edu.pl	$2b$12$JXwbg8ohScfFXkdznA7qaeQAj4G0hMOkyXGUZjvRDEbsc5DN/bacS	t	2025-05-22 17:48:43.470173	student	Jan30	Kowalski30
32	wojcik1@agh.edu.pl	$2a$12$77BppUQh7RiRB2s1J2zzL.bgLk5ZOlCgalZITttdbFJ4kkoGku6re	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
33	wojcik2@agh.edu.pl	$2a$12$20Yl/CL0AfTuLSt.Js9yGun7e2y2gcFCqGtyqKYbHkdb7V7hJNYou	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
34	wojcik3@agh.edu.pl	$2a$12$dyygZY.VITauHAc4tFtlxuMhV9qGweBCJn/8R8b8bnMtvMmxJjggu	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
35	wojcik4@agh.edu.pl	$2a$12$xBvjPIblixXk9aKbXEyKp.5rWOa7H7YZ1bTBCH16eISMkcts2aUsS	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
36	wojcik5@agh.edu.pl	$2a$12$LrUl0Yel1QHfxTQwMSJi3eo0UCZUDXex44MYi6.lAigSxiuDnebxS	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
37	wojcik6@agh.edu.pl	$2a$12$QOyrtZMxW5riUI7oGmTMXO6GdI6WEfeClkPC2lKyMY99.9zWIKmJK	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
38	wojcik7@agh.edu.pl	$2a$12$xYn/rDjeW33Akwm9C7i3p.cYPZYGqaoiDYtLmA1fHqgGjTVgdE2e.	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
39	wojcik8@agh.edu.pl	$2a$12$NzxhBAIHVn1W9R1Q2Y54eujG1F7tdfsP8ggdxqHNootHldju39X8O	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
40	wojcik9@agh.edu.pl	$2a$12$VaQUnvrupYxCh76EhJF7ousIZYgXp/ItaGoDq35ckqnk6oFAzgZm.	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
41	wojcik10@agh.edu.pl	$2a$12$GqFioGtI8bA.39/hR8.X5.TIwUR/bYDByoXWqVJotMc77hHwI3EBa	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
42	wojcik11@agh.edu.pl	$2a$12$PkyP8//Eu0IIOXsOTkn0EOweRku0IEvRpQnkyJIHTkUpIUxpElfiO	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
43	wojcik12@agh.edu.pl	$2a$12$Q1CmKOTo7tgQF9.gnC7k9eyM7BajNOv1Ni1iGarlgnkWETUoH4W1a	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
44	wojcik13@agh.edu.pl	$2a$12$cgHvYptZtTuqbnkwOSfMkOP4Qk6FL2Er/H2THn1VgtXmQCeAlHBNC	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
45	wojcik14@agh.edu.pl	$2a$12$ViE8lNmVpi4hdGv5Vo7RUeHOrHYyqncUa341/4nU25xosdaxYLKQy	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
46	wojcik15@agh.edu.pl	$2a$12$nknSgiyceewEoMFhUHj8dOTrreg7vJBnGHmc/MDZvj6SK6L0VC0Nu	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
47	wojcik16@agh.edu.pl	$2a$12$Q0G5MQMx7zU20hTx7CEIPedJvZaBBHJMSH.8rGm5JZrCQ/HGxkz1S	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
48	wojcik17@agh.edu.pl	$2a$12$DDeTzBy61DYtwqzC/UQm6uL/F5qwJFonpZ9vFHaqG5wJHlrrFhBIC	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
49	wojcik18@agh.edu.pl	$2a$12$fl5bHIN9MPFMzW0BA7CCjOl7K9FFNXqQiUJMgE5HJc3tKTVQtPBQe	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
50	wojcik19@agh.edu.pl	$2a$12$XaGcItZgpLqB3LyPDTBFjemLGA76vrrRZZqsPKZUbJnLGW0n.4K1a	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
51	wojcik20@agh.edu.pl	$2a$12$M2LYSG.u11RuWHtJbfDDxuH2QMrSZ8ozj1J3.Soc6Sv0dPOvh.VZa	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
52	wojcik21@agh.edu.pl	$2a$12$B1hu7IcmdYYaUGefQMBaR.G4kodcv6LQ4lsG0/Y6YWEUYeWxraEby	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
53	wojcik22@agh.edu.pl	$2a$12$o/66U.egTU29j1hcQqbMU.v9zGaLOU2LkteUSIACFvI06vwt8DkHO	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
54	wojcik23@agh.edu.pl	$2a$12$hUitvPGILhaIGrHeOtHR2urkG/B3ojOlAnL4DympjHonoWdPFLjFC	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
55	wojcik24@agh.edu.pl	$2a$12$nZBZI6JrL6EZjhRdWvAzE.7M2LG5ONd1AEsGJSLdZD8zX1gscfi3q	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
56	wojcik25@agh.edu.pl	$2a$12$6vj3upqtKEI94SI.iCTrledyO61azKFNJgxfh.MUc9jAUHOxCs2KS	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
57	wojcik26@agh.edu.pl	$2a$12$wWEwZGXw.1Yqfee12ziqP.Wk4UTK/8RCANIbKRabA83aPxpDabHra	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
58	wojcik27@agh.edu.pl	$2a$12$ZTrh4UpUnRG2qZHwGv22Peo3g64Th3SMCZTDbcznV3V8h1GT3xUEC	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
59	wojcik28@agh.edu.pl	$2a$12$Gg6Ap5m5JUuaqwYATcYLJOgonbhkNGGb.eErwFGhKRDB0vz17tCG6	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
60	wojcik29@agh.edu.pl	$2a$12$IfvzSVAS0trDTOQIjLWhSOJhQpcWD4RbJMNIsf4Uc6kPsTZ4.HBQS	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
61	wojcik30@agh.edu.pl	$2a$12$V1BcCtXOutnALjaLJNS9Du/kHhQSPypG1e1Y4eZDD0lHMJ/A9z4y.	t	2025-05-22 17:50:59.631071	supervisor	Mateusz	Wójcik
\.


--
-- Name: activation_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wiktor
--

SELECT pg_catalog.setval('public.activation_tokens_id_seq', 1, false);


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wiktor
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wiktor
--

SELECT pg_catalog.setval('public.applications_id_seq', 1, false);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wiktor
--

SELECT pg_catalog.setval('public.sessions_id_seq', 8, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wiktor
--

SELECT pg_catalog.setval('public.students_id_seq', 30, true);


--
-- Name: supervisors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wiktor
--

SELECT pg_catalog.setval('public.supervisors_id_seq', 30, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wiktor
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: theses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wiktor
--

SELECT pg_catalog.setval('public.theses_id_seq', 1, false);


--
-- Name: theses_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wiktor
--

SELECT pg_catalog.setval('public.theses_topics_id_seq', 50, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wiktor
--

SELECT pg_catalog.setval('public.users_id_seq', 61, true);


--
-- Name: activation_tokens activation_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.activation_tokens
    ADD CONSTRAINT activation_tokens_pkey PRIMARY KEY (id);


--
-- Name: activation_tokens activation_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.activation_tokens
    ADD CONSTRAINT activation_tokens_token_unique UNIQUE (token);


--
-- Name: activation_tokens activation_tokens_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.activation_tokens
    ADD CONSTRAINT activation_tokens_user_id_unique UNIQUE (user_id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_user_id_unique UNIQUE (user_id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_unique; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_unique UNIQUE (token);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_unique UNIQUE (user_id);


--
-- Name: supervisors supervisors_pkey; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.supervisors
    ADD CONSTRAINT supervisors_pkey PRIMARY KEY (id);


--
-- Name: supervisors supervisors_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.supervisors
    ADD CONSTRAINT supervisors_user_id_unique UNIQUE (user_id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: theses theses_pkey; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.theses
    ADD CONSTRAINT theses_pkey PRIMARY KEY (id);


--
-- Name: theses_topics theses_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.theses_topics
    ADD CONSTRAINT theses_topics_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: activation_tokens fk_activation_tokens_user_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.activation_tokens
    ADD CONSTRAINT fk_activation_tokens_user_id__id FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: admins fk_admins_user_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT fk_admins_user_id__id FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: applications fk_applications_promoter_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT fk_applications_promoter_id__id FOREIGN KEY ("Promoter_ID") REFERENCES public.supervisors(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: applications fk_applications_student_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT fk_applications_student_id__id FOREIGN KEY ("Student_ID") REFERENCES public.students(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: applications fk_applications_topic_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT fk_applications_topic_id__id FOREIGN KEY ("Topic_ID") REFERENCES public.theses_topics(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: sessions fk_sessions_user_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_sessions_user_id__id FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: students fk_students_user_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_user_id__id FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: supervisors fk_supervisors_user_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.supervisors
    ADD CONSTRAINT fk_supervisors_user_id__id FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: tags fk_tags_thesis_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT fk_tags_thesis_id__id FOREIGN KEY ("Thesis_ID") REFERENCES public.theses(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tags fk_tags_topic_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT fk_tags_topic_id__id FOREIGN KEY ("Topic_ID") REFERENCES public.theses_topics(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: theses fk_theses_supervisor_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.theses
    ADD CONSTRAINT fk_theses_supervisor_id__id FOREIGN KEY ("Supervisor_ID") REFERENCES public.supervisors(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: theses_topics fk_theses_topics_promoter_id__id; Type: FK CONSTRAINT; Schema: public; Owner: wiktor
--

ALTER TABLE ONLY public.theses_topics
    ADD CONSTRAINT fk_theses_topics_promoter_id__id FOREIGN KEY ("Promoter_ID") REFERENCES public.supervisors(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: wiktor
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

