import React, { useEffect, useRef, useState } from "react";
import "./checkin.css";

type MemberStatus = "active" | "expiring" | "expired";
type CheckInFilter = "all" | "in" | "out";
type ToastType = "success" | "error";
type PanelMode = "idle" | "preview" | "success";
type Gender = "male" | "female";

interface CheckInRecord {
  id: number;
  memberId: number;
  memberName: string;
  cardId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
}

interface Member {
  id: number;
  name: string;
  cardId: string;
  gender: Gender;
  packageName: string;
  endDate: string;
}

interface ToastState {
  message: string;
  type: ToastType;
}

const MEMBERS_STORAGE_KEY = "gymMembers";
const CHECKINS_STORAGE_KEY = "gymCheckins";

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const shiftDate = (days: number) => {
  const nextDate = new Date();
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + days);

  return formatDateKey(nextDate);
};

const createDateTime = (daysOffset: number, hour: number, minute: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);

  return date;
};

const getSeedMembers = (): Member[] => [
  {
    id: 1,
    name: "Nguyễn Văn A",
    cardId: "GYM001",
    gender: "male",
    packageName: "Gói 12 tháng",
    endDate: shiftDate(120),
  },
  {
    id: 2,
    name: "Trần Thị B",
    cardId: "GYM002",
    gender: "female",
    packageName: "Gói 6 tháng",
    endDate: shiftDate(5),
  },
  {
    id: 3,
    name: "Lê Văn C",
    cardId: "GYM003",
    gender: "male",
    packageName: "Gói 3 tháng",
    endDate: shiftDate(-12),
  },
  {
    id: 4,
    name: "Phạm Minh Dũng",
    cardId: "GYM004",
    gender: "male",
    packageName: "Gói 12 tháng",
    endDate: shiftDate(60),
  },
  {
    id: 5,
    name: "Vũ Thu Hà",
    cardId: "GYM005",
    gender: "female",
    packageName: "Gói 3 tháng",
    endDate: shiftDate(45),
  },
  {
    id: 6,
    name: "Bùi Quốc Huy",
    cardId: "GYM006",
    gender: "male",
    packageName: "Gói 6 tháng",
    endDate: shiftDate(90),
  },
  {
    id: 7,
    name: "Đặng Lan Anh",
    cardId: "GYM007",
    gender: "female",
    packageName: "Gói 1 tháng",
    endDate: shiftDate(6),
  },
  {
    id: 8,
    name: "Ngô Hữu Khang",
    cardId: "GYM008",
    gender: "male",
    packageName: "Gói 12 tháng",
    endDate: shiftDate(180),
  },
  {
    id: 9,
    name: "Lý Khánh Linh",
    cardId: "GYM009",
    gender: "female",
    packageName: "Gói 3 tháng",
    endDate: shiftDate(-10),
  },
  {
    id: 10,
    name: "Hoàng Gia Minh",
    cardId: "GYM010",
    gender: "male",
    packageName: "Gói 6 tháng",
    endDate: shiftDate(75),
  },
  {
    id: 11,
    name: "Trương Bảo Ngọc",
    cardId: "GYM011",
    gender: "female",
    packageName: "Gói 1 tháng",
    endDate: shiftDate(4),
  },
  {
    id: 12,
    name: "Mai Quốc Phong",
    cardId: "GYM012",
    gender: "male",
    packageName: "Gói 12 tháng",
    endDate: shiftDate(210),
  },
  {
    id: 13,
    name: "Phan Mỹ Quyên",
    cardId: "GYM013",
    gender: "female",
    packageName: "Gói 3 tháng",
    endDate: shiftDate(55),
  },
  {
    id: 14,
    name: "Lâm Tấn Tài",
    cardId: "GYM014",
    gender: "male",
    packageName: "Gói 6 tháng",
    endDate: shiftDate(-3),
  },
  {
    id: 15,
    name: "Cao Thảo Vy",
    cardId: "GYM015",
    gender: "female",
    packageName: "Gói 1 tháng",
    endDate: shiftDate(2),
  },
  {
    id: 16,
    name: "Đoàn Nhật Nam",
    cardId: "GYM016",
    gender: "male",
    packageName: "Gói 12 tháng",
    endDate: shiftDate(160),
  },
  {
    id: 17,
    name: "Tạ Ngọc Bích",
    cardId: "GYM017",
    gender: "female",
    packageName: "Gói 3 tháng",
    endDate: shiftDate(40),
  },
  {
    id: 18,
    name: "Hồ Đức Long",
    cardId: "GYM018",
    gender: "male",
    packageName: "Gói 6 tháng",
    endDate: shiftDate(88),
  },
  {
    id: 19,
    name: "Nguyễn Thảo Nhi",
    cardId: "GYM019",
    gender: "female",
    packageName: "Gói 1 tháng",
    endDate: shiftDate(1),
  },
  {
    id: 20,
    name: "Trịnh Hữu Phúc",
    cardId: "GYM020",
    gender: "male",
    packageName: "Gói 12 tháng",
    endDate: shiftDate(240),
  },
  {
    id: 21,
    name: "Quách Mỹ Duyên",
    cardId: "GYM021",
    gender: "female",
    packageName: "Gói 3 tháng",
    endDate: shiftDate(36),
  },
  {
    id: 22,
    name: "Kiều Minh Tuấn",
    cardId: "GYM022",
    gender: "male",
    packageName: "Gói 6 tháng",
    endDate: shiftDate(-20),
  },
  {
    id: 23,
    name: "Châu Bảo Trâm",
    cardId: "GYM023",
    gender: "female",
    packageName: "Gói 1 tháng",
    endDate: shiftDate(7),
  },
];

const mergeMembersWithSeed = (storedMembers: Member[]) => {
  const seededMembers = getSeedMembers();
  const storedByCardId = new Map(
    storedMembers.map((member) => [member.cardId.toUpperCase(), member]),
  );

  const mergedMembers = seededMembers.map((seedMember) => ({
    ...seedMember,
    ...(storedByCardId.get(seedMember.cardId) ?? {}),
  }));

  const seededCardIds = new Set(seededMembers.map((member) => member.cardId));
  const customMembers = storedMembers.filter(
    (member) => !seededCardIds.has(member.cardId),
  );

  return [...mergedMembers, ...customMembers];
};

const createSeedCheckins = (members: Member[]): CheckInRecord[] => {
  const findMember = (cardId: string) =>
    members.find((member) => member.cardId === cardId) ?? null;

  const seedConfigs = [
    { cardId: "GYM002", daysOffset: 0, hour: 6, minute: 45 },
    { cardId: "GYM001", daysOffset: 0, hour: 7, minute: 10 },
    { cardId: "GYM004", daysOffset: 0, hour: 8, minute: 15, checkoutAfter: 95 },
    { cardId: "GYM006", daysOffset: 0, hour: 9, minute: 5, checkoutAfter: 70 },
    {
      cardId: "GYM007",
      daysOffset: -1,
      hour: 17,
      minute: 40,
      checkoutAfter: 75,
    },
    {
      cardId: "GYM010",
      daysOffset: -2,
      hour: 18,
      minute: 5,
      checkoutAfter: 88,
    },
    {
      cardId: "GYM013",
      daysOffset: -3,
      hour: 19,
      minute: 10,
      checkoutAfter: 82,
    },
    {
      cardId: "GYM018",
      daysOffset: -4,
      hour: 6,
      minute: 30,
      checkoutAfter: 60,
    },
    {
      cardId: "GYM021",
      daysOffset: -5,
      hour: 18,
      minute: 45,
      checkoutAfter: 90,
    },
    {
      cardId: "GYM023",
      daysOffset: -6,
      hour: 7,
      minute: 25,
      checkoutAfter: 65,
    },
  ];

  return seedConfigs.flatMap((config, index) => {
    const member = findMember(config.cardId);
    if (!member) {
      return [];
    }

    const checkInDate = createDateTime(
      config.daysOffset,
      config.hour,
      config.minute,
    );
    const checkOutTime =
      typeof config.checkoutAfter === "number"
        ? new Date(
            checkInDate.getTime() + config.checkoutAfter * 60 * 1000,
          ).toISOString()
        : null;

    return [
      {
        id: Number(
          `${Math.abs(config.daysOffset)}${String(index + 1).padStart(2, "0")}${String(member.id).padStart(3, "0")}`,
        ),
        memberId: member.id,
        memberName: member.name,
        cardId: member.cardId,
        date: formatDateKey(checkInDate),
        checkInTime: checkInDate.toISOString(),
        checkOutTime,
      },
    ];
  });
};

const parseStoredJson = <T,>(storageKey: string): T | null => {
  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

const loadStoredMembers = () => {
  const storedMembers = parseStoredJson<Member[]>(MEMBERS_STORAGE_KEY);

  if (Array.isArray(storedMembers) && storedMembers.length > 0) {
    const mergedMembers = mergeMembersWithSeed(storedMembers);
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(mergedMembers));
    return mergedMembers;
  }

  const seededMembers = getSeedMembers();
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(seededMembers));

  return seededMembers;
};

const loadStoredCheckins = (members: Member[]) => {
  const storedCheckins = parseStoredJson<CheckInRecord[]>(CHECKINS_STORAGE_KEY);

  if (!Array.isArray(storedCheckins)) {
    const seededCheckins = createSeedCheckins(members);
    localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(seededCheckins));
    return seededCheckins;
  }

  const cutoffDate = shiftDate(-7);
  const cleanedCheckins = storedCheckins.filter((record) => {
    return typeof record.date === "string" && record.date >= cutoffDate;
  });

  if (cleanedCheckins.length === 0) {
    const seededCheckins = createSeedCheckins(members);
    localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(seededCheckins));
    return seededCheckins;
  }

  if (cleanedCheckins.length !== storedCheckins.length) {
    localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(cleanedCheckins));
  }

  return cleanedCheckins;
};

const getAvatarUrl = (name: string, gender?: Gender) => {
  const background = gender === "female" ? "ec4899" : "3b82f6";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff`;
};

const getMemberStatus = (endDate: string): MemberStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(endDate);
  expiryDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return "expired";
  }

  if (diffDays <= 7) {
    return "expiring";
  }

  return "active";
};

const getStatusText = (status: MemberStatus) => {
  switch (status) {
    case "active":
      return "Còn hạn";
    case "expiring":
      return "Sắp hết hạn";
    case "expired":
      return "Hết hạn";
    default:
      return "";
  }
};

const getRecordStatus = (record: CheckInRecord) => {
  return record.checkOutTime ? "out" : "in";
};

const formatDisplayDate = (value: string) => {
  return new Date(value).toLocaleDateString("vi-VN");
};

const formatDisplayTime = (value: string, withSeconds = false) => {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
  });
};

const formatDisplayDateTime = (value: string) => {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateAverageDaily = (records: CheckInRecord[]) => {
  const last7Days = Array.from({ length: 7 }, (_, index) => shiftDate(-index));
  const last7DaysCount = records.filter((record) =>
    last7Days.includes(record.date),
  ).length;

  return Math.round(last7DaysCount / 7);
};

const loadInitialCheckinData = () => {
  const members = loadStoredMembers();
  const checkins = loadStoredCheckins(members);

  return { members, checkins };
};

const CheckIn: React.FC = () => {
  const [initialData] = useState(loadInitialCheckinData);
  const [members] = useState<Member[]>(initialData.members);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>(
    initialData.checkins,
  );
  const [cardIdInput, setCardIdInput] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [panelMode, setPanelMode] = useState<PanelMode>("idle");
  const [previewMember, setPreviewMember] = useState<Member | null>(null);
  const [successMessage, setSuccessMessage] = useState(
    "Chào mừng bạn đến FitZone!",
  );
  const [filterCheckin, setFilterCheckin] = useState<CheckInFilter>("all");
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CheckInRecord | null>(
    null,
  );
  const [toast, setToast] = useState<ToastState | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const successTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Try loading today's checkins from API
    const loadFromAPI = async () => {
      try {
        const res = await fetch("http://localhost:7000/admin/DiemDanh/today");
        if (res.ok) {
          const data = await res.json();
          console.log("Today checkins from API:", data?.length || 0);
        }
      } catch {
        /* Backend unavailable */
      }
    };
    loadFromAPI();

    return () => {
      window.clearInterval(timer);

      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }

      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(checkInRecords));
  }, [checkInRecords]);

  useEffect(() => {
    if (panelMode === "idle" && !showMemberDetail) {
      inputRef.current?.focus();
    }
  }, [panelMode, showMemberDetail]);

  useEffect(() => {
    if (!selectedRecord) {
      return;
    }

    const latestRecord = checkInRecords.find(
      (record) => record.id === selectedRecord.id,
    );

    if (latestRecord) {
      setSelectedRecord(latestRecord);
    }
  }, [checkInRecords, selectedRecord]);

  const showToast = (message: string, type: ToastType) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setToast({ message, type });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const resetCheckinPanel = () => {
    setPreviewMember(null);
    setPanelMode("idle");
    setCardIdInput("");
  };

  const checkoutById = (checkinId: number) => {
    let checkedOutMemberName = "";

    setCheckInRecords((previousRecords) =>
      previousRecords.map((record) => {
        if (record.id !== checkinId || record.checkOutTime) {
          return record;
        }

        checkedOutMemberName = record.memberName;

        return {
          ...record,
          checkOutTime: new Date().toISOString(),
        };
      }),
    );

    if (checkedOutMemberName) {
      showToast(`${checkedOutMemberName} đã check-out!`, "success");
    }

    resetCheckinPanel();
  };

  const processCheckin = () => {
    const normalizedCardId = cardIdInput.trim().toUpperCase();

    if (!normalizedCardId) {
      showToast("Vui lòng nhập mã thẻ!", "error");
      return;
    }

    const matchedMember = members.find(
      (member) => member.cardId === normalizedCardId,
    );

    if (!matchedMember) {
      showToast("Không tìm thấy hội viên với mã thẻ này!", "error");
      return;
    }

    const todayKey = formatDateKey(new Date());
    const activeCheckin = checkInRecords.find((record) => {
      return (
        record.memberId === matchedMember.id &&
        record.date === todayKey &&
        !record.checkOutTime
      );
    });

    if (activeCheckin) {
      checkoutById(activeCheckin.id);
      return;
    }

    setCardIdInput(normalizedCardId);
    setPreviewMember(matchedMember);
    setPanelMode("preview");
  };

  const confirmCheckin = () => {
    if (!previewMember) {
      return;
    }

    const memberStatus = getMemberStatus(previewMember.endDate);

    if (memberStatus === "expired") {
      showToast("Thẻ hội viên đã hết hạn! Vui lòng gia hạn.", "error");
      return;
    }

    const newRecord: CheckInRecord = {
      id: Date.now(),
      memberId: previewMember.id,
      memberName: previewMember.name,
      cardId: previewMember.cardId,
      date: formatDateKey(new Date()),
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
    };

    setCheckInRecords((previousRecords) => [newRecord, ...previousRecords]);
    setSuccessMessage(`Chào mừng ${previewMember.name} đến FitZone!`);
    setPreviewMember(null);
    setPanelMode("success");
    setCardIdInput("");

    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current);
    }

    successTimeoutRef.current = window.setTimeout(() => {
      resetCheckinPanel();
    }, 2500);
  };

  const cancelPreview = () => {
    resetCheckinPanel();
  };

  const openMemberDetail = (record: CheckInRecord) => {
    setSelectedRecord(record);
    setShowMemberDetail(true);
  };

  const checkoutMember = () => {
    if (!selectedRecord) {
      return;
    }

    checkoutById(selectedRecord.id);
    setShowMemberDetail(false);
  };

  const handleCardInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      processCheckin();
    }
  };

  const todayKey = formatDateKey(currentTime);
  const todayCheckins = checkInRecords
    .filter((record) => record.date === todayKey)
    .sort(
      (left, right) =>
        new Date(right.checkInTime).getTime() -
        new Date(left.checkInTime).getTime(),
    );

  const filteredTodayCheckins = todayCheckins.filter((record) => {
    if (filterCheckin === "all") {
      return true;
    }

    return getRecordStatus(record) === filterCheckin;
  });

  const currentlyIn = todayCheckins.filter((record) => !record.checkOutTime);
  const checkedOut = todayCheckins.filter(
    (record) => record.checkOutTime,
  ).length;
  const averageDaily = calculateAverageDaily(checkInRecords);
  const previewStatus = previewMember
    ? getMemberStatus(previewMember.endDate)
    : null;
  const lastPreviewCheckin = previewMember
    ? [...checkInRecords]
        .filter((record) => record.memberId === previewMember.id)
        .sort(
          (left, right) =>
            new Date(right.checkInTime).getTime() -
            new Date(left.checkInTime).getTime(),
        )[0]
    : null;
  const selectedMember = selectedRecord
    ? (members.find((member) => member.id === selectedRecord.memberId) ?? null)
    : null;

  return (
    <div className="checkin-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>
            <i className="fas fa-qrcode"></i> Check-in hội viên
          </h1>
          <p>Quản lý check-in/check-out hội viên tại phòng tập</p>
        </div>
        <div className="page-header-right">
          <div className="current-time">
            <i className="fas fa-clock"></i>
            <span>{formatDisplayTime(currentTime.toISOString(), true)}</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fas fa-sign-in-alt"></i>
          </div>
          <div className="stat-info">
            <p>Check-in hôm nay</p>
            <h3>{todayCheckins.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-info">
            <p>Đang tập</p>
            <h3>{currentlyIn.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fas fa-sign-out-alt"></i>
          </div>
          <div className="stat-info">
            <p>Đã check-out</p>
            <h3>{checkedOut}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="stat-info">
            <p>Trung bình/ngày</p>
            <h3>{averageDaily}</h3>
          </div>
        </div>
      </div>

      <div className="checkin-grid">
        <div className="card checkin-panel">
          <div className="card-header">
            <h2>
              <i className="fas fa-qrcode"></i> Quét mã / Nhập mã thẻ
            </h2>
          </div>
          <div className="card-body">
            {panelMode === "idle" && (
              <div className="checkin-input-area">
                <div className="qr-scanner-placeholder">
                  <i className="fas fa-qrcode"></i>
                  <p>Quét mã QR hoặc nhập mã thẻ</p>
                </div>
                <div className="manual-input">
                  <div className="input-group">
                    <input
                      ref={inputRef}
                      type="text"
                      id="cardIdInput"
                      value={cardIdInput}
                      onChange={(event) =>
                        setCardIdInput(event.target.value.toUpperCase())
                      }
                      onKeyDown={handleCardInputKeyDown}
                      placeholder="Nhập mã thẻ (VD: GYM001)"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={processCheckin}
                    >
                      <i className="fas fa-check"></i> Check-in
                    </button>
                  </div>
                  <p className="input-hint">Nhấn Enter để check-in nhanh</p>
                </div>
              </div>
            )}

            {panelMode === "preview" && previewMember && previewStatus && (
              <div className="member-preview">
                <div className="preview-header">
                  <img
                    src={getAvatarUrl(previewMember.name, previewMember.gender)}
                    alt={previewMember.name}
                  />
                  <div className="preview-info">
                    <h3>{previewMember.name}</h3>
                    <p>{previewMember.cardId}</p>
                  </div>
                  <div className="preview-status">
                    <span className={`status-badge ${previewStatus}`}>
                      {getStatusText(previewStatus)}
                    </span>
                  </div>
                </div>
                <div className="preview-details">
                  <div className="detail-item">
                    <i className="fas fa-box"></i>
                    <span>{previewMember.packageName}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>
                      Hết hạn: {formatDisplayDate(previewMember.endDate)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-history"></i>
                    <span>
                      {lastPreviewCheckin
                        ? `Lần cuối: ${formatDisplayDateTime(lastPreviewCheckin.checkInTime)}`
                        : "Lần đầu check-in"}
                    </span>
                  </div>
                </div>
                <div className="preview-actions">
                  <button
                    type="button"
                    className="btn btn-success btn-lg"
                    onClick={confirmCheckin}
                  >
                    <i className="fas fa-sign-in-alt"></i> Xác nhận Check-in
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelPreview}
                  >
                    <i className="fas fa-times"></i> Hủy
                  </button>
                </div>
              </div>
            )}

            {panelMode === "success" && (
              <div className="checkin-success">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2>Check-in thành công!</h2>
                <p>{successMessage}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card checkin-list-card">
          <div className="card-header">
            <h2>
              <i className="fas fa-list"></i> Lịch sử check-in hôm nay
            </h2>
            <div className="card-actions">
              <select
                value={filterCheckin}
                onChange={(event) =>
                  setFilterCheckin(event.target.value as CheckInFilter)
                }
              >
                <option value="all">Tất cả</option>
                <option value="in">Đang tập</option>
                <option value="out">Đã ra</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            <div className="checkin-list">
              {filteredTodayCheckins.length === 0 ? (
                <div className="empty-checkin">
                  <i className="fas fa-clipboard-list"></i>
                  <h3>Chưa có check-in hôm nay</h3>
                  <p>Nhập mã thẻ để check-in hội viên</p>
                </div>
              ) : (
                filteredTodayCheckins.map((record) => {
                  const matchedMember = members.find(
                    (member) => member.id === record.memberId,
                  );
                  const recordStatus = getRecordStatus(record);

                  return (
                    <div
                      key={record.id}
                      className="checkin-item"
                      onClick={() => openMemberDetail(record)}
                    >
                      <img
                        src={getAvatarUrl(
                          record.memberName,
                          matchedMember?.gender,
                        )}
                        alt={record.memberName}
                      />
                      <div className="checkin-item-info">
                        <h4>{record.memberName}</h4>
                        <p>{record.cardId}</p>
                      </div>
                      <div className="checkin-item-time">
                        <div className="time">
                          {formatDisplayTime(record.checkInTime)}
                        </div>
                        <span className={`status ${recordStatus}`}>
                          {recordStatus === "in" ? "Đang tập" : "Đã ra"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card currently-in-card">
        <div className="card-header">
          <h2>
            <i className="fas fa-users"></i> Hội viên đang tập (
            <span>{currentlyIn.length}</span>)
          </h2>
        </div>
        <div className="card-body">
          <div className="currently-in-grid">
            {currentlyIn.length === 0 ? (
              <div className="empty-checkin currently-empty">
                <i className="fas fa-user-clock"></i>
                <h3>Không có hội viên đang tập</h3>
              </div>
            ) : (
              currentlyIn.map((record) => {
                const matchedMember = members.find(
                  (member) => member.id === record.memberId,
                );

                return (
                  <div
                    key={record.id}
                    className="currently-in-item"
                    onClick={() => openMemberDetail(record)}
                  >
                    <img
                      src={getAvatarUrl(
                        record.memberName,
                        matchedMember?.gender,
                      )}
                      alt={record.memberName}
                    />
                    <div className="info">
                      <h4>{record.memberName}</h4>
                      <p>
                        <i className="fas fa-clock"></i> Vào lúc{" "}
                        {formatDisplayTime(record.checkInTime)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showMemberDetail && selectedRecord && (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowMemberDetail(false)}
          ></div>
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>
                <i className="fas fa-user"></i> Thông tin hội viên
              </h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowMemberDetail(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="member-detail">
                <div className="member-detail-header">
                  <img
                    src={getAvatarUrl(
                      selectedRecord.memberName,
                      selectedMember?.gender,
                    )}
                    alt={selectedRecord.memberName}
                  />
                  <h3>{selectedRecord.memberName}</h3>
                  <p>{selectedRecord.cardId}</p>
                </div>
                <div className="member-detail-info">
                  <div className="member-detail-row">
                    <i className="fas fa-box"></i>
                    <span>{selectedMember?.packageName || "N/A"}</span>
                  </div>
                  <div className="member-detail-row">
                    <i className="fas fa-sign-in-alt"></i>
                    <span>
                      Check-in:{" "}
                      {formatDisplayDateTime(selectedRecord.checkInTime)}
                    </span>
                  </div>
                  <div className="member-detail-row">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>
                      Check-out:{" "}
                      {selectedRecord.checkOutTime
                        ? formatDisplayDateTime(selectedRecord.checkOutTime)
                        : "Chưa check-out"}
                    </span>
                  </div>
                  <div className="member-detail-row">
                    <i className="fas fa-calendar"></i>
                    <span>
                      Hết hạn:{" "}
                      {selectedMember
                        ? formatDisplayDate(selectedMember.endDate)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowMemberDetail(false)}
              >
                Đóng
              </button>
              {!selectedRecord.checkOutTime && (
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={checkoutMember}
                >
                  <i className="fas fa-sign-out-alt"></i> Check-out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast show ${toast.type}`}>
          <i
            className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}
          ></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default CheckIn;
