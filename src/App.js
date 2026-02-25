import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  Briefcase,
  Users,
  GraduationCap,
  ArrowRight,
  Target,
  BrainCircuit,
  MessageSquare,
  FileImage,
  Mail,
  Smartphone,
  CheckCircle2,
  Share2,
  X,
  Copy,
  Plus,
  FileText,
  Trash2,
  Pencil,
  Paperclip,
  Search,
  Phone,
  FileEdit,
  Calendar,
  Video,
  Presentation,
  CheckSquare,
  LayoutDashboard,
  KanbanSquare,
  MessageCircle,
  Clock,
  MapPin,
  User,
  UserCircle,
  ChevronUp,
  ChevronDown,
  Settings,
  Loader2,
  BarChart3,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// --- INITIAL DEFAULT DATA (Loaded if database is empty) ---
const INITIAL_TEAM = [
  "Alex (Admin)",
  "Rahul (Sales)",
  "Priya (Outreach)",
  "Sarah (Support)",
  "David (Management)",
];

const actionTypes = [
  {
    id: "research",
    label: "Research",
    icon: <Search className="w-3 h-3" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    id: "email",
    label: "Email",
    icon: <Mail className="w-3 h-3" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: "call",
    label: "Call",
    icon: <Phone className="w-3 h-3" />,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    id: "message",
    label: "Message",
    icon: <MessageSquare className="w-3 h-3" />,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    id: "prepare",
    label: "Prepare",
    icon: <FileEdit className="w-3 h-3" />,
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: <Calendar className="w-3 h-3" />,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  {
    id: "virtual",
    label: "Virtual Meeting",
    icon: <Video className="w-3 h-3" />,
    color: "bg-sky-100 text-sky-700 border-sky-200",
  },
  {
    id: "physical",
    label: "Physical Meeting",
    icon: <Users className="w-3 h-3" />,
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    id: "workshop",
    label: "Workshop/Event",
    icon: <Presentation className="w-3 h-3" />,
    color: "bg-pink-100 text-pink-700 border-pink-200",
  },
  {
    id: "general",
    label: "Task",
    icon: <CheckSquare className="w-3 h-3" />,
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
];

const INITIAL_FUNNELS = {
  corporate: {
    id: "corporate",
    title: "Corporate Pipeline",
    gatekeeper: "HR / PR / Manager",
    motivation: "Employee productivity, wellness, and retention.",
    reality:
      "When parents are stressed about their child's exams or study habits, their work focus plummets.",
    pitchTitle: 'The "Working Parent Wellness Initiative"',
    pitchDesc:
      'You aren\'t pitching an ed-tech platform. You provide a free session or the "Instant Parent Success Kit" as a value-add corporate perk that HR can offer to their employees to reduce home stress.',
    steps: [
      {
        title: "Outreach",
        desc: 'Cold email/LinkedIn to HR focused on "Employee Wellness".',
        tasks: [
          {
            text: "Research company wellness initiatives",
            assetId: null,
            actionType: "research",
          },
          {
            text: "Connect with HR on LinkedIn",
            assetId: null,
            actionType: "message",
          },
          {
            text: "Send initial Outreach Email",
            assetId: "outreach",
            actionType: "email",
          },
          { text: "Follow-up Call (Day 3)", assetId: null, actionType: "call" },
        ],
      },
      {
        title: "The Pitch",
        desc: "15-min meeting offering the free Wellness Initiative perk.",
        tasks: [
          {
            text: "Prepare Pitch Deck",
            assetId: "pitch",
            actionType: "prepare",
          },
          {
            text: "Conduct 15-min Zoom Pitch",
            assetId: null,
            actionType: "virtual",
          },
          {
            text: "Send onboarding internal email template to HR",
            assetId: null,
            actionType: "email",
          },
        ],
      },
      {
        title: "Distribution",
        desc: "HR sends internal email to staff with your WhatsApp Link/QR.",
        tasks: [
          {
            text: "Verify HR sent the email",
            assetId: null,
            actionType: "general",
          },
          {
            text: "Monitor incoming parent clicks",
            assetId: null,
            actionType: "general",
          },
        ],
      },
      {
        title: "The Handoff",
        desc: 'Parent clicks link. Trigger: "Hi Smart Hub..."',
        tasks: [
          {
            text: "Auto-reply fires in Picky Assist",
            assetId: "nurture",
            actionType: "message",
          },
          {
            text: 'Tag user in CRM as "Corporate Lead"',
            assetId: null,
            actionType: "general",
          },
        ],
      },
    ],
    assets: {
      outreach: {
        title: "HR Outreach Email",
        type: "mail",
        content:
          "Subject: Employee Wellness Perk - Supporting Working Parents\n\nHi [HR Name],\n\nI noticed [Company] places a strong emphasis on employee well-being. One of the hidden productivity killers we've found is 'home stress'—specifically, working parents worrying about their children's studies and screen time.\n\nWe run a 'Working Parent Wellness Initiative' where we provide a free 'Instant Parent Success Kit' as a corporate perk. It takes zero budget and zero effort from HR to implement.\n\nWould you be open to a 10-minute chat this Thursday to see if it's a fit for your team?",
      },
      pitch: {
        title: "HR Pitch Deck Outline",
        type: "document",
        content:
          "Slide 1: The Hidden Productivity Killer\n- Stressed parents = distracted employees.\n\nSlide 2: The Solution\n- An automated, WhatsApp-based Parent Success Kit.\n\nSlide 3: The Offer\n- We want to give this to your employees as a free company perk.\n\nSlide 4: Implementation\n- Zero effort for HR. Just forward our pre-written internal email with a link. We handle all the parent nurturing.",
      },
      nurture: {
        title: "Corporate Nurture Flow",
        type: "message",
        content:
          "Parent clicks link. Auto-populates: 'Hi Smart Hub, I want Autolearn's Instant Parent Success Kit!'\n\nBot Reply:\n'Hi! Welcome to the Autolearn Parent Success Kit, courtesy of [Company Name]'s Wellness Initiative! 🎁\n\nTo give you the best tips right away, what grade is your child in?'\n\n[Buttons: Primary | Middle | High School]",
      },
    },
  },
  community: {
    id: "community",
    title: "Community Pipeline",
    gatekeeper: "Society / Association Head / Manager",
    motivation:
      "Resident engagement, community harmony, and looking like an active, value-adding committee.",
    reality:
      "Organizing weekend events that families actually want to attend is difficult and time-consuming.",
    pitchTitle: 'The "Plug-and-Play Community Event"',
    pitchDesc:
      'A weekend "Parenting & Student Focus" seminar in their clubhouse. You make the association head look like a hero for bringing a high-value educational expert right to their doorstep.',
    steps: [
      {
        title: "Outreach",
        desc: "WhatsApp/Call to Society Head offering a free weekend event.",
        tasks: [
          {
            text: "Identify 10 local Society Heads",
            assetId: null,
            actionType: "research",
          },
          {
            text: "Send WhatsApp Outreach script",
            assetId: "outreach",
            actionType: "message",
          },
          { text: "Follow-up call", assetId: null, actionType: "call" },
        ],
      },
      {
        title: "The Pitch",
        desc: "Show how easy it is. You handle everything; they just book the hall.",
        tasks: [
          {
            text: "Send Event Flyer template",
            assetId: "pitch",
            actionType: "email",
          },
          {
            text: "Confirm date and hall booking",
            assetId: null,
            actionType: "schedule",
          },
        ],
      },
      {
        title: "Distribution",
        desc: "Head posts event flyer & WhatsApp link in the Society Group.",
        tasks: [
          {
            text: "Send reminder 2 days before",
            assetId: null,
            actionType: "message",
          },
          { text: "Track RSVP QR scans", assetId: null, actionType: "general" },
        ],
      },
      {
        title: "The Handoff",
        desc: 'Parent attends/scans QR. Trigger: "Hi Smart Hub..."',
        tasks: [
          {
            text: "Auto-send Pre-Event Checklist",
            assetId: "nurture",
            actionType: "message",
          },
          { text: "Run weekend event", assetId: null, actionType: "workshop" },
          {
            text: "Capture remaining leads on-site",
            assetId: null,
            actionType: "physical",
          },
        ],
      },
    ],
    assets: {
      outreach: {
        title: "Society Head WhatsApp",
        type: "message",
        content:
          "Hi [Name], I see you organize great events for [Society Name]. Finding weekend activities that families actually value (and attend) can be tough.\n\nWe offer a free 'Plug-and-Play' Parenting & Student Focus seminar. We bring the expert and the value; you just book the clubhouse. It’s a great way to engage residents.\n\nAre you open to hosting a free session next month?",
      },
      pitch: {
        title: "Community Event Flyer",
        type: "document",
        content:
          "Headline: Transform Your Child's Study Habits (Without the Fights!)\n\nSub-headline: An exclusive weekend masterclass for [Society Name] residents.\n\nValue: Learn the 3 secrets to self-driven studying.\n\nCall to Action: Scan QR to RSVP and get your free Pre-Event Checklist instantly on WhatsApp!",
      },
      nurture: {
        title: "Event Nurture Flow",
        type: "message",
        content:
          "Parent scans QR. Auto-populates: 'Hi Smart Hub, RSVP me for the [Society] Event!'\n\nBot Reply:\n'Awesome! You are confirmed for the Masterclass at [Society Name]. 🎉\n\nWhile you wait for the event, here is a quick 2-minute video on how to set up a distraction-free study desk...'",
      },
    },
  },
  schools: {
    id: "schools",
    title: "Schools Pipeline",
    gatekeeper: "Receptionist → Administrator → Principal",
    motivation:
      "School reputation, academic results, and reducing friction with demanding parents.",
    reality:
      "Principals are bombarded with vendors selling software and books. They block external noise.",
    pitchTitle: 'The "School Reputation Amplifier"',
    pitchDesc:
      "You aren't selling tuition. Your system helps their students build better habits, which leads to better results, making the school look prestigious and innovative.",
    steps: [
      {
        title: "Outreach",
        desc: 'Bypass standard vendor routes. Approach via alumni or "Academic Workshop" proposal.',
        tasks: [
          {
            text: "Research School Principal on LinkedIn",
            assetId: null,
            actionType: "research",
          },
          {
            text: "Send Academic Workshop proposal email",
            assetId: "outreach",
            actionType: "email",
          },
          {
            text: "Call Receptionist to confirm receipt",
            assetId: null,
            actionType: "call",
          },
        ],
      },
      {
        title: "The Pitch",
        desc: "Focus on habit-building boosting aggregate school scores.",
        tasks: [
          {
            text: "Present School Pitch Proposal",
            assetId: "pitch",
            actionType: "physical",
          },
          {
            text: "Agree on Circular Distribution date",
            assetId: null,
            actionType: "schedule",
          },
        ],
      },
      {
        title: "Distribution",
        desc: "School includes your Success Kit link in the weekly circular/newsletter.",
        tasks: [
          {
            text: "Provide exact QR code & blurb to school admin",
            assetId: null,
            actionType: "prepare",
          },
          {
            text: "Verify inclusion in circular",
            assetId: null,
            actionType: "general",
          },
        ],
      },
      {
        title: "The Handoff",
        desc: 'Parent reads circular, clicks link. Trigger: "Hi Smart Hub..."',
        tasks: [
          {
            text: "Welcome automation sequence triggers",
            assetId: "nurture",
            actionType: "message",
          },
          {
            text: "Tag parent with School Name in CRM",
            assetId: null,
            actionType: "general",
          },
        ],
      },
    ],
    assets: {
      outreach: {
        title: "Principal Outreach Email",
        type: "mail",
        content:
          "Subject: Enhancing Student Habits & School Aggregates\n\nDear Principal [Name],\n\nWe know school administrators are constantly pitched new software. We don't sell software; we solve habits.\n\nWe provide a 'Parent Success Kit' that helps families build better study routines at home, directly supporting your teachers' efforts in the classroom and boosting overall academic results.\n\nWe'd like to offer this framework to [School Name] parents at no cost. Do you have 10 minutes to review the framework?",
      },
      pitch: {
        title: "School Pitch Proposal",
        type: "document",
        content:
          "Focus Area: Creating a seamless Teacher-Parent-Student loop.\n\nKey Metric: Improved daily habit tracking at home leads to a proven bump in aggregate test scores.\n\nDistribution Method: Add a simple blurb and our WhatsApp QR code to your weekly school circular or parent communication app.",
      },
      nurture: {
        title: "School Nurture Flow",
        type: "message",
        content:
          "Parent clicks circular link. Auto-populates: 'Hi Smart Hub, I want the Autolearn Kit from [School Name]!'\n\nBot Reply:\n'Welcome! [School Name] is dedicated to your child's success, and we're here to help build those powerful home study habits. 📚\n\nClick below to download your first habit tracker...'",
      },
    },
  },
};

// --- FIREBASE INITIALIZATION ---
const userConfig = {
  apiKey: "AIzaSyCvHW055ZEsd2PuoVyGTeZmdliqdH3Bm1Q",
  authDomain: "autolearn-crm.firebaseapp.com",
  projectId: "autolearn-crm",
  storageBucket: "autolearn-crm.firebasestorage.app",
  messagingSenderId: "204612073674",
  appId: "1:204612073674:web:522c207392b487d7efdc33",
};

// Detect if we are in the Preview canvas or CodeSandbox
const isCanvas = typeof __firebase_config !== "undefined";
const firebaseConfig = isCanvas ? JSON.parse(__firebase_config) : userConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// FIX: Establish strict Collection Paths to satisfy Firebase's odd-segment requirement
const appId = typeof __app_id !== "undefined" ? __app_id : "autolearn-crm-app";
const LEADS_COL_PATH = isCanvas
  ? `artifacts/${appId}/public/data/leads`
  : `leads`;
const CONFIG_COL_PATH = isCanvas
  ? `artifacts/${appId}/public/data/config`
  : `config`;

export default function App() {
  // Application UI State
  const [appMode, setAppMode] = useState("crm");
  const [activeTab, setActiveTab] = useState("corporate");
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbUser, setDbUser] = useState(null);
  const [authError, setAuthError] = useState("");

  // Real-time Database State
  const [funnels, setFunnels] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);

  // Local User State
  const [currentUser, setCurrentUser] = useState("");

  // Computed Security State
  const isAdmin = currentUser.toLowerCase().includes("admin");

  // Modal & Form States
  const [isManagingTeam, setIsManagingTeam] = useState(false);
  const [tempTeam, setTempTeam] = useState([]);
  const [isEditingPipeline, setIsEditingPipeline] = useState(false);
  const [pipelineEditForm, setPipelineEditForm] = useState({});
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [newAssetForm, setNewAssetForm] = useState({
    title: "",
    type: "mail",
    content: "",
    attachmentUrl: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingRoadmap, setIsEditingRoadmap] = useState(false);
  const [editingSteps, setEditingSteps] = useState([]);

  // CRM State
  const [leads, setLeads] = useState([]);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    organization: "",
    phone: "",
    location: "",
    city: "",
    leadSource: "",
    owner: "",
    pipeline: "corporate",
  });
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [newNote, setNewNote] = useState("");

  // --- 1. FIREBASE AUTH & REAL-TIME SYNC ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setAuthError(err.message);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) setDbUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Force non-admins out of the strategy builder view if they change their user type
  useEffect(() => {
    if (!isAdmin && appMode === "strategy") {
      setAppMode("crm");
    }
  }, [isAdmin, appMode]);

  useEffect(() => {
    if (!dbUser) return;

    // Listen to Leads
    const leadsUnsub = onSnapshot(
      collection(db, LEADS_COL_PATH),
      (snapshot) => {
        const loadedLeads = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeads(loadedLeads);
      },
      console.error
    );

    // Listen to Funnels Strategy
    const funnelsUnsub = onSnapshot(
      doc(db, CONFIG_COL_PATH, "funnels"),
      (docSnap) => {
        if (docSnap.exists()) {
          setFunnels(docSnap.data());
        } else {
          setDoc(doc(db, CONFIG_COL_PATH, "funnels"), INITIAL_FUNNELS);
          setFunnels(INITIAL_FUNNELS);
        }
        setIsDbReady(true);
      },
      console.error
    );

    // Listen to Team Settings
    const settingsUnsub = onSnapshot(
      doc(db, CONFIG_COL_PATH, "settings"),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().team) {
          setTeamMembers(docSnap.data().team);
          setCurrentUser(
            (prev) => prev || docSnap.data().team[0] || "Unknown User"
          );
        } else {
          setDoc(doc(db, CONFIG_COL_PATH, "settings"), { team: INITIAL_TEAM });
          setTeamMembers(INITIAL_TEAM);
          setCurrentUser(INITIAL_TEAM[0]);
        }
      },
      console.error
    );

    return () => {
      leadsUnsub();
      funnelsUnsub();
      settingsUnsub();
    };
  }, [dbUser]);

  // --- Helper to Push Pipeline/Strategy changes to Cloud ---
  const updateCloudFunnels = (updatedFunnels) => {
    setDoc(doc(db, CONFIG_COL_PATH, "funnels"), updatedFunnels);
  };

  // --- Helper Icons for UI ---
  const getAssetIcon = (type) => {
    if (type === "mail") return <Mail className="w-5 h-5" />;
    if (type === "image") return <FileImage className="w-5 h-5" />;
    if (type === "message") return <MessageSquare className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };
  const getTabIcon = (id) => {
    if (id === "corporate") return <Briefcase className="w-5 h-5" />;
    if (id === "community") return <Users className="w-5 h-5" />;
    if (id === "schools") return <GraduationCap className="w-5 h-5" />;
    return <Target className="w-5 h-5" />;
  };

  // --- Utility Functions ---
  const handleCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  // --- Strategy & Asset Management ---
  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!newAssetForm.title || !newAssetForm.content) return;
    const assetKey = editingKey || `custom_${Date.now()}`;

    const newFunnels = {
      ...funnels,
      [activeTab]: {
        ...funnels[activeTab],
        assets: {
          ...funnels[activeTab].assets,
          [assetKey]: {
            title: newAssetForm.title,
            type: newAssetForm.type,
            content: newAssetForm.content,
            attachment: newAssetForm.attachmentUrl
              ? {
                  name: "External Link",
                  url: newAssetForm.attachmentUrl,
                  type: "link",
                }
              : null,
          },
        },
      },
    };

    updateCloudFunnels(newFunnels);
    setNewAssetForm({
      title: "",
      type: "mail",
      content: "",
      attachmentUrl: "",
    });
    setIsAddingAsset(false);
    setEditingKey(null);
  };

  const handleEditAsset = () => {
    setNewAssetForm({
      title: selectedAsset.title,
      type: selectedAsset.type || "mail",
      content: selectedAsset.content,
      attachmentUrl: selectedAsset.attachment
        ? selectedAsset.attachment.url
        : "",
    });
    setEditingKey(selectedAsset.id);
    setIsAddingAsset(true);
    setSelectedAsset(null);
  };

  const confirmDeleteAsset = () => {
    const updated = { ...funnels };
    updated[activeTab] = {
      ...updated[activeTab],
      assets: { ...updated[activeTab].assets },
    };
    delete updated[activeTab].assets[selectedAsset.id];

    updateCloudFunnels(updated);
    setSelectedAsset(null);
    setShowDeleteConfirm(false);
  };

  const openRoadmapEditor = () => {
    setEditingSteps([
      ...activeData.steps.map((s) => ({
        ...s,
        tasks: s.tasks
          ? s.tasks.map((t) =>
              typeof t === "string"
                ? { text: t, assetId: null, actionType: "general" }
                : { ...t, actionType: t.actionType || "general" }
            )
          : [],
      })),
    ]);
    setIsEditingRoadmap(true);
  };

  const moveStepUp = (index) => {
    if (index === 0) return;
    const newSteps = [...editingSteps];
    [newSteps[index - 1], newSteps[index]] = [
      newSteps[index],
      newSteps[index - 1],
    ];
    setEditingSteps(newSteps);
  };

  const moveStepDown = (index) => {
    if (index === editingSteps.length - 1) return;
    const newSteps = [...editingSteps];
    [newSteps[index + 1], newSteps[index]] = [
      newSteps[index],
      newSteps[index + 1],
    ];
    setEditingSteps(newSteps);
  };

  const deleteStep = (index) => {
    const newSteps = [...editingSteps];
    newSteps.splice(index, 1);
    setEditingSteps(newSteps);
  };

  const addNewStep = () => {
    setEditingSteps([
      ...editingSteps,
      {
        title: "New Pipeline Phase",
        desc: "Description of this new step...",
        tasks: [],
      },
    ]);
  };

  const saveRoadmap = () => {
    const maxIndex = editingSteps.length - 1;
    // Fix leads that might be stranded in deleted stages
    leads.forEach((lead) => {
      if (lead.pipeline === activeTab && lead.stageIndex > maxIndex) {
        setDoc(
          doc(db, LEADS_COL_PATH, lead.id),
          { stageIndex: Math.max(0, maxIndex) },
          { merge: true }
        );
      }
    });

    const newFunnels = {
      ...funnels,
      [activeTab]: { ...funnels[activeTab], steps: editingSteps },
    };
    updateCloudFunnels(newFunnels);
    setIsEditingRoadmap(false);
  };

  // --- CRM & Lead Management (Live DB Calls) ---
  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.organization) return;

    const leadId = Date.now().toString();
    const newLead = {
      name: newLeadForm.name,
      organization: newLeadForm.organization,
      phone: newLeadForm.phone,
      location: newLeadForm.location,
      city: newLeadForm.city,
      leadSource: newLeadForm.leadSource,
      owner: newLeadForm.owner || currentUser,
      lastUpdatedBy: currentUser,
      pipeline: newLeadForm.pipeline,
      stageIndex: 0,
      checkedTasks: [],
      notes: [],
      createdAt: new Date().toISOString(),
    };

    setDoc(doc(db, LEADS_COL_PATH, leadId), newLead);
    setIsAddingLead(false);
  };

  const toggleTask = (leadId, taskKey) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const checked = lead.checkedTasks
      ? lead.checkedTasks.includes(taskKey)
      : false;
    const updatedTasks = checked
      ? lead.checkedTasks.filter((k) => k !== taskKey)
      : [...(lead.checkedTasks || []), taskKey];

    setDoc(
      doc(db, LEADS_COL_PATH, leadId),
      {
        checkedTasks: updatedTasks,
        lastUpdatedBy: currentUser,
      },
      { merge: true }
    );
  };

  const addNote = (leadId) => {
    if (!newNote.trim()) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    setDoc(
      doc(db, LEADS_COL_PATH, leadId),
      {
        notes: [
          { date: new Date().toISOString(), text: newNote },
          ...(lead.notes || []),
        ],
        lastUpdatedBy: currentUser,
      },
      { merge: true }
    );

    setNewNote("");
  };

  const advanceStage = (leadId, maxStages) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stageIndex >= maxStages - 1) return;

    setDoc(
      doc(db, LEADS_COL_PATH, leadId),
      {
        stageIndex: lead.stageIndex + 1,
        lastUpdatedBy: currentUser,
      },
      { merge: true }
    );
  };

  const changeLeadStage = (leadId, newStageIndex) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    setDoc(
      doc(db, LEADS_COL_PATH, leadId),
      {
        stageIndex: newStageIndex,
        lastUpdatedBy: currentUser,
      },
      { merge: true }
    );
  };

  // --- RENDERING GUARDS ---

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl max-w-lg text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Firebase Configuration Error
          </h2>
          <p className="text-red-600 text-sm mb-4 font-mono bg-red-100 p-2 rounded">
            {authError}
          </p>
          <div className="text-left text-sm text-gray-700 bg-white p-4 rounded-lg border border-red-100">
            <p className="font-bold mb-2">
              How to fix this in your Firebase Console:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Go to <strong>Build &gt; Authentication</strong> in the left
                menu.
              </li>
              <li>
                Click on the <strong>Sign-in method</strong> tab.
              </li>
              <li>
                Find <strong>Anonymous</strong>, click it, and toggle it to{" "}
                <strong>Enable</strong>.
              </li>
              <li>
                Click <strong>Save</strong> and refresh this CodeSandbox page.
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Connecting to Live Team Board...</h2>
        <p className="text-gray-500 mt-2">Syncing your pipelines and leads.</p>
      </div>
    );
  }

  const activeData = funnels[activeTab];
  if (!activeData) return null; // Safe guard

  const activeLeads = leads.filter((l) => l.pipeline === activeTab);
  const activeLeadObj = leads.find((l) => l.id === activeLeadId);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      {/* Top Application Header / Mode Switcher */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Autolearn Gatekeeper Engine
              </h1>
              <p className="text-sm text-green-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
                Live Cloud Sync Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Show Current Logged In User Dropdown */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 border-r border-gray-200 pr-4">
              <UserCircle className="w-5 h-5" />
              <select
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-900 font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                title="Select Active Team Member"
              >
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              {isAdmin && (
                <button
                  onClick={() => {
                    setTempTeam([...teamMembers]);
                    setIsManagingTeam(true);
                  }}
                  className="p-1.5 ml-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
                  title="Manage Team Members"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setAppMode("dashboard")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                  appMode === "dashboard"
                    ? "bg-white text-emerald-700 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Dashboard
              </button>
              <button
                onClick={() => setAppMode("crm")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                  appMode === "crm"
                    ? "bg-white text-blue-700 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <KanbanSquare className="w-4 h-4" /> Team Execution
              </button>
              {isAdmin && (
                <button
                  onClick={() => setAppMode("strategy")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                    appMode === "strategy"
                      ? "bg-white text-indigo-700 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Strategy Builder
                  (Admin)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-1">
        {/* Navigation Tabs (Applies to both modes) */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          {Object.keys(funnels).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
            >
              {getTabIcon(funnels[key].id)}
              {funnels[key].title}
            </button>
          ))}
        </div>

        {/* =========================================
            MODE 1: TEAM EXECUTION (CRM KANBAN)
        ========================================= */}
        {appMode === "crm" && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Active Leads: {activeData.title}
                </h2>
                <p className="text-gray-600">
                  Track and advance gatekeeper conversations.
                </p>
              </div>
              <button
                onClick={() => {
                  setNewLeadForm({
                    name: "",
                    organization: "",
                    phone: "",
                    location: "",
                    city: "",
                    leadSource: "",
                    owner: currentUser,
                    pipeline: activeTab,
                  });
                  setIsAddingLead(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" /> Add Lead
              </button>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
              {activeData.steps.map((step, stepIndex) => {
                const stageLeads = activeLeads.filter(
                  (l) => l.stageIndex === stepIndex
                );

                return (
                  <div
                    key={stepIndex}
                    className="min-w-[320px] w-[320px] flex flex-col bg-gray-100 rounded-xl border border-gray-200 p-3 max-h-[70vh]"
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs">
                          {stepIndex + 1}
                        </span>
                        {step.title}
                      </h3>
                      <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 overflow-y-auto">
                      {stageLeads.map((lead) => {
                        const totalTasks = step.tasks ? step.tasks.length : 0;
                        const completedTasks = lead.checkedTasks
                          ? lead.checkedTasks.filter((k) =>
                              k.startsWith(`${stepIndex}-`)
                            ).length
                          : 0;
                        const progress =
                          totalTasks === 0
                            ? 100
                            : Math.round((completedTasks / totalTasks) * 100);

                        return (
                          <div
                            key={lead.id}
                            onClick={() => setActiveLeadId(lead.id)}
                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                          >
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {lead.name}
                            </h4>
                            <p className="text-sm text-gray-500 mb-2">
                              {lead.organization}
                            </p>

                            {/* Rich Details Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {lead.city && (
                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 flex items-center gap-1 font-medium border border-gray-200">
                                  <MapPin className="w-3 h-3" /> {lead.city}
                                </span>
                              )}
                              {lead.leadSource && (
                                <span className="text-[10px] bg-purple-50 px-2 py-1 rounded text-purple-700 flex items-center gap-1 font-medium border border-purple-100">
                                  <Target className="w-3 h-3" />{" "}
                                  {lead.leadSource}
                                </span>
                              )}
                              {lead.owner && (
                                <span className="text-[10px] bg-blue-50 px-2 py-1 rounded text-blue-700 flex items-center gap-1 font-medium border border-blue-100">
                                  <User className="w-3 h-3" /> {lead.owner}
                                </span>
                              )}
                            </div>

                            {totalTasks > 0 && (
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold text-gray-500">
                                  <span>Task Progress</span>
                                  <span>
                                    {completedTasks}/{totalTasks}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      progress === 100
                                        ? "bg-green-500"
                                        : "bg-blue-500"
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            {lead.notes && lead.notes.length > 0 && (
                              <div className="mt-3 text-[11px] text-gray-400 flex items-center justify-between border-t border-gray-50 pt-2">
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" /> Note
                                  added
                                </span>
                                <span>
                                  Upd: {lead.lastUpdatedBy.split(" ")[0]}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {stageLeads.length === 0 && (
                        <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm font-medium">
                          No leads in this stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================
            MODE 2: STRATEGY BUILDER (ADMIN)
        ========================================= */}
        {appMode === "strategy" && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column: Psychology & Pitch */}
            <div className="lg:col-span-1 space-y-6">
              {/* Gatekeeper Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Target className="w-6 h-6" />
                    <h2 className="text-xl font-bold text-gray-900">
                      The Gatekeeper Strategy
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setPipelineEditForm({ ...activeData });
                      setIsEditingPipeline(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Edit Strategy Details"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Target Profile
                    </span>
                    <p className="font-semibold text-lg text-gray-800">
                      {activeData.gatekeeper}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Core Motivation
                    </span>
                    <p className="text-gray-600 mt-1">
                      {activeData.motivation}
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      The Reality
                    </span>
                    <p className="text-indigo-900 text-sm mt-1 italic">
                      "{activeData.reality}"
                    </p>
                  </div>
                </div>
              </div>

              {/* The Pitch Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-6 h-6 text-blue-200" />
                  <h2 className="text-xl font-bold">The Trojan Horse</h2>
                </div>
                <h3 className="text-lg font-bold text-blue-100 mb-2">
                  {activeData.pitchTitle}
                </h3>
                <p className="text-blue-50 leading-relaxed text-sm">
                  {activeData.pitchDesc}
                </p>
              </div>
            </div>

            {/* Right Column: Funnel & Assets */}
            <div className="lg:col-span-2 space-y-6">
              {/* Funnel Roadmap */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-green-500" />
                    Pipeline Roadmap & Process
                  </h2>
                  <button
                    onClick={openRoadmapEditor}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Process
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-[1.1rem] w-0.5 bg-gray-200"></div>
                  <div className="space-y-6 relative">
                    {activeData.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="relative flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center text-blue-600 font-bold z-10 shadow-sm">
                          {index + 1}
                        </div>
                        <div className="pt-1 w-full">
                          <h3 className="font-bold text-gray-900">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {step.desc}
                          </p>

                          {step.tasks && step.tasks.length > 0 && (
                            <div className="mt-3 bg-gray-50 border border-gray-100 rounded-lg p-3">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Process / Checklist
                              </h4>
                              <ul className="space-y-3">
                                {step.tasks.map((task, tIndex) => {
                                  const taskText =
                                    typeof task === "string" ? task : task.text;
                                  const assetId =
                                    typeof task === "string"
                                      ? null
                                      : task.assetId;
                                  const actionTypeId =
                                    typeof task === "string"
                                      ? "general"
                                      : task.actionType || "general";
                                  const linkedAsset =
                                    assetId && activeData.assets
                                      ? activeData.assets[assetId]
                                      : null;
                                  const actionDef =
                                    actionTypes.find(
                                      (a) => a.id === actionTypeId
                                    ) || actionTypes[actionTypes.length - 1];

                                  return (
                                    <li
                                      key={tIndex}
                                      className="flex flex-col gap-1.5 text-sm text-gray-700 bg-white p-2.5 rounded-md border border-gray-100 shadow-sm"
                                    >
                                      <div className="flex items-start gap-2.5">
                                        <div
                                          className={`mt-0.5 shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${actionDef.color}`}
                                        >
                                          {actionDef.icon}
                                          {actionDef.label}
                                        </div>
                                        <span className="flex-1 font-medium">
                                          {taskText}
                                        </span>
                                      </div>
                                      {linkedAsset && (
                                        <div className="pl-[5.5rem] mt-0.5">
                                          <button
                                            onClick={() => {
                                              setSelectedAsset({
                                                ...linkedAsset,
                                                id: assetId,
                                              });
                                              setShowDeleteConfirm(false);
                                            }}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-semibold transition-colors border border-blue-200"
                                          >
                                            <Paperclip className="w-3.5 h-3.5" />
                                            Preview {linkedAsset.title}
                                          </button>
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Asset Vault */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Asset & Template Vault
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Create and manage scripts, emails, and media used in this
                  pipeline.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeData.assets &&
                    Object.entries(activeData.assets).map(([key, asset]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedAsset({ ...asset, id: key });
                          setShowDeleteConfirm(false);
                        }}
                        className="flex flex-col items-center text-center justify-center gap-3 p-4 border border-dashed border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          {getAssetIcon(asset.type)}
                        </div>
                        <span className="font-semibold text-sm text-gray-700">
                          {asset.title}
                        </span>
                        <span className="text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Edit Template →
                        </span>
                      </button>
                    ))}

                  <button
                    onClick={() => {
                      setNewAssetForm({
                        title: "",
                        type: "mail",
                        content: "",
                        attachmentUrl: "",
                      });
                      setEditingKey(null);
                      setIsAddingAsset(true);
                    }}
                    className="flex flex-col items-center text-center justify-center gap-3 p-4 border-2 border-dashed border-gray-200 bg-gray-50 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 group-hover:text-green-600 group-hover:border-green-300 transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm text-gray-600 group-hover:text-green-700">
                      Add New Resource
                    </span>
                    <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Add Content →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            MODE 3: ANALYTICS & PERFORMANCE DASHBOARD
        ========================================= */}
        {appMode === "dashboard" &&
          (() => {
            const totalLeads = leads.length;
            const leadsByOwner = leads.reduce((acc, l) => {
              acc[l.owner] = (acc[l.owner] || 0) + 1;
              return acc;
            }, {});
            const topOwner = Object.entries(leadsByOwner).sort(
              (a, b) => b[1] - a[1]
            )[0] || ["None", 0];

            const activePipelineLeads = leads.filter(
              (l) => l.pipeline === activeTab
            );
            const stagesCount =
              activeData?.steps.map(
                (_, idx) =>
                  activePipelineLeads.filter((l) => l.stageIndex === idx).length
              ) || [];

            let bottleneckInsight =
              "Looking healthy! Keep moving leads through the pipeline stages.";
            if (stagesCount.length > 1) {
              if (stagesCount[0] < 5 && activePipelineLeads.length < 5) {
                bottleneckInsight = `Low outreach volume for ${activeData?.title}. Plan of Action: Increase top-of-funnel prospecting and cold outreach immediately.`;
              } else if (stagesCount[0] > 0 && stagesCount[1] === 0) {
                bottleneckInsight =
                  "Leads are getting stuck in the initial Outreach stage. Plan of Action: Review pitch scripts and aggressively follow up with initial contacts.";
              } else if (
                stagesCount[stagesCount.length - 1] === 0 &&
                activePipelineLeads.length > 8
              ) {
                bottleneckInsight =
                  "High volume of leads, but low closing rate. Plan of Action: Shift the team's focus to follow-ups, overcoming objections, and finalizing handoffs.";
              }
            }

            return (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />{" "}
                      Performance Dashboard
                    </h2>
                    <p className="text-gray-600">
                      Track team standings, identify bottlenecks, and plan sales
                      actions.
                    </p>
                  </div>
                </div>

                {/* Action Plan Banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                  <div className="p-3 bg-emerald-100 rounded-full text-emerald-700 shrink-0">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-lg">
                      AI Action Plan for {activeData?.title}
                    </h3>
                    <p className="text-emerald-800 mt-1 font-medium">
                      {bottleneckInsight}
                    </p>
                  </div>
                </div>

                {/* Top KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Total System Leads
                      </p>
                      <h3 className="text-3xl font-black text-gray-900">
                        {totalLeads}
                      </h3>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Active in {activeData?.title}
                      </p>
                      <h3 className="text-3xl font-black text-gray-900">
                        {activePipelineLeads.length}
                      </h3>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Top Performer
                      </p>
                      <h3
                        className="text-xl font-black text-gray-900 truncate"
                        title={topOwner[0]}
                      >
                        {topOwner[0]}
                      </h3>
                      <p className="text-xs font-bold text-amber-600">
                        {topOwner[1]} Assigned Leads
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Funnel Analysis */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      Pipeline Funnel: {activeData?.title}
                    </h3>
                    <div className="space-y-5 mt-4">
                      {activeData?.steps.map((step, idx) => {
                        const count = activePipelineLeads.filter(
                          (l) => l.stageIndex === idx
                        ).length;
                        const percentage =
                          activePipelineLeads.length > 0
                            ? Math.round(
                                (count / activePipelineLeads.length) * 100
                              )
                            : 0;
                        return (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="font-bold text-gray-700">
                                {idx + 1}. {step.title}
                              </span>
                              <span className="font-bold text-gray-900">
                                {count} Leads{" "}
                                <span className="text-gray-400 font-normal">
                                  ({percentage}%)
                                </span>
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div
                                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                      {activeData?.steps.length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          No stages in this pipeline yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Team Leaderboard */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      Team Leaderboard (All Pipelines)
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(leadsByOwner)
                        .sort((a, b) => b[1] - a[1])
                        .map(([owner, count], idx) => {
                          const percentage =
                            totalLeads > 0
                              ? Math.round((count / totalLeads) * 100)
                              : 0;
                          return (
                            <div
                              key={owner}
                              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                  idx === 0
                                    ? "bg-amber-200 text-amber-800"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                #{idx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="font-bold text-gray-800 text-sm">
                                    {owner}
                                  </span>
                                  <span className="text-sm font-bold text-gray-600">
                                    {count} Deals
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-emerald-500 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {Object.keys(leadsByOwner).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4 italic">
                          No leads assigned to team members yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>

      {/* =========================================
          MODALS & OVERLAYS
      ========================================= */}

      {/* 1. Add Lead Modal */}
      {isAddingLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New Gatekeeper Lead
              </h3>
              <button
                onClick={() => setIsAddingLead(false)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={handleAddLead}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Column 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, name: e.target.value })
                    }
                    placeholder="e.g. John Doe"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Organization / School *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.organization}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        organization: e.target.value,
                      })
                    }
                    placeholder="e.g. Acme Corp"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Lead Type (Pipeline)
                  </label>
                  <select
                    value={newLeadForm.pipeline}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        pipeline: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    {Object.keys(funnels).map((key) => (
                      <option key={key} value={key}>
                        {funnels[key].title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Lead Source
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.leadSource}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        leadSource: e.target.value,
                      })
                    }
                    placeholder="e.g. LinkedIn, Referral..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.phone}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, phone: e.target.value })
                    }
                    placeholder="e.g. +1 234 567 890"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Location (State/Region)
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.location}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        location: e.target.value,
                      })
                    }
                    placeholder="e.g. New York"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.city}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, city: e.target.value })
                    }
                    placeholder="e.g. Manhattan"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Assigned Owner
                  </label>
                  <select
                    value={newLeadForm.owner}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, owner: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    {teamMembers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingLead(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm shadow-sm"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Execute Lead Modal (The Team View) */}
      {activeLeadObj && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
            {/* Lead Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-gray-50 shrink-0">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeLeadObj.name}
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-200">
                    {funnels[activeLeadObj.pipeline]?.title || "Unknown"}
                  </span>
                </div>

                {/* Rich Info Tags Row */}
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-gray-400" />{" "}
                    {activeLeadObj.organization}
                  </span>
                  {activeLeadObj.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-gray-400" />{" "}
                      {activeLeadObj.phone}
                    </span>
                  )}
                  {activeLeadObj.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />{" "}
                      {activeLeadObj.location}
                    </span>
                  )}
                  {activeLeadObj.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />{" "}
                      {activeLeadObj.city}
                    </span>
                  )}
                  {activeLeadObj.leadSource && (
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-gray-400" /> Source:{" "}
                      {activeLeadObj.leadSource}
                    </span>
                  )}
                  {activeLeadObj.owner && (
                    <span className="flex items-center gap-1.5">
                      <UserCircle className="w-4 h-4 text-gray-400" /> Owner:{" "}
                      <span className="text-gray-900">
                        {activeLeadObj.owner}
                      </span>
                    </span>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-500 bg-white inline-flex px-2 py-1 rounded border border-gray-200">
                  Last updated by{" "}
                  <strong className="ml-1 text-gray-800">
                    {activeLeadObj.lastUpdatedBy}
                  </strong>
                </div>
              </div>
              <button
                onClick={() => setActiveLeadId(null)}
                className="p-1 hover:bg-gray-200 rounded-full shrink-0"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Main Execution Area */}
              <div className="flex-1 border-r border-gray-100 p-6 overflow-y-auto bg-white">
                {/* Stage Banner */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
                      Current Pipeline Stage{" "}
                      <Pencil className="w-3 h-3 text-blue-400" />
                    </span>
                    <div className="mt-1">
                      <select
                        value={activeLeadObj.stageIndex}
                        onChange={(e) =>
                          changeLeadStage(
                            activeLeadObj.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="text-lg font-bold text-blue-900 bg-white border border-blue-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm w-full max-w-sm"
                      >
                        {funnels[activeLeadObj.pipeline]?.steps.map(
                          (step, idx) => (
                            <option key={idx} value={idx}>
                              {idx + 1}. {step.title}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                  {activeLeadObj.stageIndex <
                  funnels[activeLeadObj.pipeline].steps.length - 1 ? (
                    <button
                      onClick={() =>
                        advanceStage(
                          activeLeadObj.id,
                          funnels[activeLeadObj.pipeline].steps.length
                        )
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-all shrink-0"
                    >
                      Advance Stage <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-green-200 shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Pipeline Complete
                    </span>
                  )}
                </div>

                {/* Checklist for Current Stage */}
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-gray-400" /> Required
                  Actions
                </h4>

                <div className="space-y-3">
                  {funnels[activeLeadObj.pipeline].steps[
                    activeLeadObj.stageIndex
                  ]?.tasks?.map((task, tIndex) => {
                    const taskKey = `${activeLeadObj.stageIndex}-${tIndex}`;
                    const isChecked =
                      activeLeadObj.checkedTasks?.includes(taskKey);
                    const taskText =
                      typeof task === "string" ? task : task.text;
                    const actionTypeId =
                      typeof task === "string"
                        ? "general"
                        : task.actionType || "general";
                    const assetId =
                      typeof task === "string" ? null : task.assetId;
                    const linkedAsset = assetId
                      ? funnels[activeLeadObj.pipeline].assets[assetId]
                      : null;
                    const actionDef =
                      actionTypes.find((a) => a.id === actionTypeId) ||
                      actionTypes[actionTypes.length - 1];

                    return (
                      <div
                        key={taskKey}
                        className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
                          isChecked
                            ? "bg-gray-50 border-gray-200"
                            : "bg-white border-gray-200 shadow-sm hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() =>
                              toggleTask(activeLeadObj.id, taskKey)
                            }
                            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-gray-300 text-transparent hover:border-blue-400"
                            }`}
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </button>

                          <div
                            className={`flex-1 transition-all ${
                              isChecked ? "opacity-60" : "opacity-100"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${actionDef.color} flex items-center gap-1.5`}
                              >
                                {actionDef.icon} {actionDef.label}
                              </span>
                            </div>
                            <span
                              className={`font-medium text-sm ${
                                isChecked
                                  ? "text-gray-500 line-through"
                                  : "text-gray-800"
                              }`}
                            >
                              {taskText}
                            </span>
                          </div>
                        </div>

                        {/* Resource Trigger Button */}
                        {linkedAsset && !isChecked && (
                          <div className="pl-8 mt-1">
                            <button
                              onClick={() =>
                                setSelectedAsset({
                                  ...linkedAsset,
                                  id: assetId,
                                })
                              }
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-sm rounded-md text-sm font-semibold transition-all border border-blue-200"
                            >
                              <Paperclip className="w-4 h-4" />
                              Use Template: {linkedAsset.title}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(!funnels[activeLeadObj.pipeline].steps[
                    activeLeadObj.stageIndex
                  ]?.tasks ||
                    funnels[activeLeadObj.pipeline].steps[
                      activeLeadObj.stageIndex
                    ].tasks.length === 0) && (
                    <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                      No tasks assigned for this stage.
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar: Notes & Activity */}
              <div className="w-full md:w-80 bg-gray-50 flex flex-col p-4 md:border-l border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-gray-400" /> Status &
                  Notes
                </h4>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {activeLeadObj.notes &&
                    activeLeadObj.notes.map((note, nIdx) => (
                      <div
                        key={nIdx}
                        className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-sm"
                      >
                        <p className="text-gray-800">{note.text}</p>
                        <div className="mt-2 text-xs text-gray-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(note.date).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                  {(!activeLeadObj.notes ||
                    activeLeadObj.notes.length === 0) && (
                    <p className="text-sm text-gray-400 italic text-center mt-4">
                      No notes added yet.
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 shrink-0">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a status update or note..."
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none h-20 mb-2"
                  />
                  <button
                    onClick={() => addNote(activeLeadObj.id)}
                    className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Asset Edit Modal (Admin) & Asset Preview Modal (CRM) */}
      {(isAddingAsset || selectedAsset) && !isEditingRoadmap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                {isAddingAsset ? (
                  editingKey ? (
                    <Pencil className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )
                ) : (
                  getAssetIcon(selectedAsset?.type)
                )}
                {isAddingAsset
                  ? editingKey
                    ? "Edit Resource"
                    : `Add Resource`
                  : selectedAsset?.title}
              </h3>
              <button
                onClick={() => {
                  setIsAddingAsset(false);
                  setSelectedAsset(null);
                  setEditingKey(null);
                  setShowDeleteConfirm(false);
                }}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* If Adding/Editing (Admin Mode) */}
            {isAddingAsset && (
              <form
                onSubmit={handleAddAsset}
                className="p-6 flex flex-col gap-4 overflow-y-auto bg-white"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Resource Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newAssetForm.title}
                    onChange={(e) =>
                      setNewAssetForm({
                        ...newAssetForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Resource Type
                  </label>
                  <select
                    value={newAssetForm.type}
                    onChange={(e) =>
                      setNewAssetForm({ ...newAssetForm, type: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="mail">Email / Direct Outreach</option>
                    <option value="message">WhatsApp / Messaging</option>
                    <option value="image">Pitch Deck / Flyer</option>
                    <option value="document">Text Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Content / Script
                  </label>
                  <textarea
                    required
                    rows="6"
                    value={newAssetForm.content}
                    onChange={(e) =>
                      setNewAssetForm({
                        ...newAssetForm,
                        content: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" /> External Attachment URL
                    (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g., Google Drive or Dropbox link..."
                    value={newAssetForm.attachmentUrl || ""}
                    onChange={(e) =>
                      setNewAssetForm({
                        ...newAssetForm,
                        attachmentUrl: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    To keep the live database fast, paste links to files instead
                    of uploading them.
                  </p>
                </div>
                <div className="pt-2 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAsset(false);
                      setEditingKey(null);
                    }}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                  >
                    Save Resource to Cloud
                  </button>
                </div>
              </form>
            )}

            {/* If Viewing (Admin or Team Mode) */}
            {selectedAsset && (
              <>
                <div className="p-6 overflow-y-auto bg-white flex-1 flex flex-col gap-4">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {selectedAsset.content}
                  </pre>
                  {selectedAsset.attachment && (
                    <div className="mt-2 p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" /> Attached Link
                      </h4>
                      <a
                        href={selectedAsset.attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg text-blue-600 text-sm font-medium hover:shadow-sm"
                      >
                        <FileText className="w-4 h-4" /> Open{" "}
                        {selectedAsset.attachment.name} in New Tab
                      </a>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                  {/* Show Edit/Delete only if we accessed this via Strategy view */}
                  {appMode === "strategy" ? (
                    showDeleteConfirm ? (
                      <div className="flex items-center gap-3 w-full bg-red-50 p-3 rounded-lg justify-between border border-red-100">
                        <span className="text-sm font-semibold text-red-800">
                          Delete this resource globally?
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1 text-gray-600 bg-white border border-gray-300 rounded font-medium text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmDeleteAsset}
                            className="px-3 py-1 bg-red-600 text-white rounded font-medium text-sm"
                          >
                            Yes, Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                        <div className="flex gap-3">
                          <button
                            onClick={handleEditAsset}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm font-medium"
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleCopy(selectedAsset.content)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                          >
                            <Copy className="w-4 h-4" />{" "}
                            {copied ? "Copied!" : "Copy Text"}
                          </button>
                        </div>
                      </>
                    )
                  ) : (
                    /* If opened from CRM Team view, just show copy button */
                    <div className="w-full flex justify-end">
                      <button
                        onClick={() => handleCopy(selectedAsset.content)}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700"
                      >
                        <Copy className="w-4 h-4" />{" "}
                        {copied
                          ? "Copied to Clipboard!"
                          : "Copy Template to Clipboard"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Edit Roadmap Process Modal (Admin only) */}
      {isEditingRoadmap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" /> Edit Process:{" "}
                {activeData.title}
              </h3>
              <button
                onClick={() => setIsEditingRoadmap(false)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-white flex-1 flex flex-col gap-8">
              {editingSteps.map((step, sIndex) => (
                <div
                  key={sIndex}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative"
                >
                  {/* Phase Move/Delete Controls */}
                  <div className="flex justify-between items-center mb-4 pl-4 border-b border-gray-200 pb-3">
                    <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-md border-2 border-white">
                      {sIndex + 1}
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Configure Phase
                    </span>
                    <div className="flex gap-1">
                      <button
                        disabled={sIndex === 0}
                        onClick={() => moveStepUp(sIndex)}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 shadow-sm rounded border border-gray-200 disabled:opacity-40 transition-all"
                      >
                        <ChevronUp className="w-4 h-4" /> Up
                      </button>
                      <button
                        disabled={sIndex === editingSteps.length - 1}
                        onClick={() => moveStepDown(sIndex)}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 shadow-sm rounded border border-gray-200 disabled:opacity-40 transition-all"
                      >
                        <ChevronDown className="w-4 h-4" /> Down
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        onClick={() => deleteStep(sIndex)}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-red-600 bg-white hover:bg-red-50 shadow-sm rounded border border-gray-200 transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pl-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Phase Title
                      </label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const n = [...editingSteps];
                          n[sIndex].title = e.target.value;
                          setEditingSteps(n);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Phase Description
                      </label>
                      <input
                        type="text"
                        value={step.desc}
                        onChange={(e) => {
                          const n = [...editingSteps];
                          n[sIndex].desc = e.target.value;
                          setEditingSteps(n);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pl-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Process / Tasks
                    </label>
                    <div className="space-y-4">
                      {step.tasks &&
                        step.tasks.map((task, tIndex) => {
                          const taskText =
                            typeof task === "string" ? task : task.text;
                          const assetId =
                            typeof task === "string" ? "" : task.assetId || "";
                          const actionType =
                            typeof task === "string"
                              ? "general"
                              : task.actionType || "general";

                          return (
                            <div
                              key={tIndex}
                              className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <select
                                  value={actionType}
                                  onChange={(e) => {
                                    const n = [...editingSteps];
                                    if (
                                      typeof n[sIndex].tasks[tIndex] ===
                                      "string"
                                    ) {
                                      n[sIndex].tasks[tIndex] = {
                                        text: n[sIndex].tasks[tIndex],
                                        assetId: null,
                                        actionType: e.target.value,
                                      };
                                    } else {
                                      n[sIndex].tasks[tIndex].actionType =
                                        e.target.value;
                                    }
                                    setEditingSteps(n);
                                  }}
                                  className="w-[160px] p-2 border border-gray-300 rounded-md text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {actionTypes.map((at) => (
                                    <option key={at.id} value={at.id}>
                                      {at.label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={taskText}
                                  onChange={(e) => {
                                    const n = [...editingSteps];
                                    if (
                                      typeof n[sIndex].tasks[tIndex] ===
                                      "string"
                                    ) {
                                      n[sIndex].tasks[tIndex] = {
                                        text: e.target.value,
                                        assetId: null,
                                        actionType: "general",
                                      };
                                    } else {
                                      n[sIndex].tasks[tIndex].text =
                                        e.target.value;
                                    }
                                    setEditingSteps(n);
                                  }}
                                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => {
                                    const n = [...editingSteps];
                                    n[sIndex].tasks.splice(tIndex, 1);
                                    setEditingSteps(n);
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 pl-1 border-t border-gray-50 pt-2">
                                <Paperclip className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Linked Asset:
                                </span>
                                <select
                                  value={assetId}
                                  onChange={(e) => {
                                    const n = [...editingSteps];
                                    const newAssetId =
                                      e.target.value === ""
                                        ? null
                                        : e.target.value;
                                    if (
                                      typeof n[sIndex].tasks[tIndex] ===
                                      "string"
                                    ) {
                                      n[sIndex].tasks[tIndex] = {
                                        text: n[sIndex].tasks[tIndex],
                                        assetId: newAssetId,
                                        actionType: "general",
                                      };
                                    } else {
                                      n[sIndex].tasks[tIndex].assetId =
                                        newAssetId;
                                    }
                                    setEditingSteps(n);
                                  }}
                                  className="flex-1 p-1.5 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">
                                    -- No Resource Linked --
                                  </option>
                                  {activeData.assets &&
                                    Object.entries(activeData.assets).map(
                                      ([key, a]) => (
                                        <option key={key} value={key}>
                                          {a.title}
                                        </option>
                                      )
                                    )}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      <button
                        onClick={() => {
                          const n = [...editingSteps];
                          if (!n[sIndex].tasks) n[sIndex].tasks = [];
                          n[sIndex].tasks.push({
                            text: "",
                            assetId: null,
                            actionType: "general",
                          });
                          setEditingSteps(n);
                        }}
                        className="flex items-center justify-center w-full gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-lg border border-dashed border-blue-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add New Task to{" "}
                        {step.title}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addNewStep}
                className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-inherit">
                  <Plus className="w-6 h-6" />
                </div>
                Create New Pipeline Phase
              </button>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsEditingRoadmap(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveRoadmap}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium shadow-sm"
              >
                Save Process to Cloud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Manage Team Modal */}
      {isManagingTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Manage Team Members
              </h3>
              <button
                onClick={() => setIsManagingTeam(false)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-3">
              <div className="bg-blue-50 p-3 rounded-lg mb-2 text-xs text-blue-800 border border-blue-100 font-medium">
                Tip: Add the word <strong>(Admin)</strong> next to a user's name
                to give them access to the Strategy Builder tab.
              </div>
              {tempTeam.map((member, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => {
                      const newTeam = [...tempTeam];
                      newTeam[index] = e.target.value;
                      setTempTeam(newTeam);
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                  <button
                    onClick={() => {
                      const newTeam = [...tempTeam];
                      newTeam.splice(index, 1);
                      setTempTeam(newTeam);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setTempTeam([...tempTeam, "New Member"])}
                className="flex items-center justify-center w-full gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 p-2.5 rounded-lg border border-dashed border-blue-200 transition-colors mt-2"
              >
                <Plus className="w-4 h-4" /> Add Team Member
              </button>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsManagingTeam(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDoc(
                    doc(db, CONFIG_COL_PATH, "settings"),
                    { team: tempTeam },
                    { merge: true }
                  );
                  setIsManagingTeam(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium shadow-sm"
              >
                Save Roster to Cloud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Edit Pipeline/Strategy Details Modal */}
      {isEditingPipeline && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-600" />
                Edit Pipeline Details
              </h3>
              <button
                onClick={() => setIsEditingPipeline(false)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-5 bg-white">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Pipeline Tab Title
                </label>
                <input
                  type="text"
                  value={pipelineEditForm.title}
                  onChange={(e) =>
                    setPipelineEditForm({
                      ...pipelineEditForm,
                      title: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Target Gatekeeper Profile
                </label>
                <input
                  type="text"
                  value={pipelineEditForm.gatekeeper}
                  onChange={(e) =>
                    setPipelineEditForm({
                      ...pipelineEditForm,
                      gatekeeper: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Core Motivation
                </label>
                <textarea
                  rows="2"
                  value={pipelineEditForm.motivation}
                  onChange={(e) =>
                    setPipelineEditForm({
                      ...pipelineEditForm,
                      motivation: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  The Reality (Current Pain Point)
                </label>
                <textarea
                  rows="2"
                  value={pipelineEditForm.reality}
                  onChange={(e) =>
                    setPipelineEditForm({
                      ...pipelineEditForm,
                      reality: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col gap-4">
                <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5" /> The Pitch (Trojan Horse)
                </h4>
                <div>
                  <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
                    Pitch Headline
                  </label>
                  <input
                    type="text"
                    value={pipelineEditForm.pitchTitle}
                    onChange={(e) =>
                      setPipelineEditForm({
                        ...pipelineEditForm,
                        pitchTitle: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-semibold text-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
                    Pitch Description
                  </label>
                  <textarea
                    rows="3"
                    value={pipelineEditForm.pitchDesc}
                    onChange={(e) =>
                      setPipelineEditForm({
                        ...pipelineEditForm,
                        pitchDesc: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white resize-none text-indigo-900"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsEditingPipeline(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateCloudFunnels({
                    ...funnels,
                    [activeTab]: pipelineEditForm,
                  });
                  setIsEditingPipeline(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium shadow-sm"
              >
                Save Strategy Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
