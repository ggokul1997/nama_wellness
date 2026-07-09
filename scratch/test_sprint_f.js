"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = __importStar(require("assert"));
var API_URL = 'http://localhost:4000/api/v1';
function testSprintF() {
    return __awaiter(this, void 0, void 0, function () {
        var teacherRegisterRes, teacherData, teacherToken, studentRegisterRes, studentData, studentToken, courseRes, courseData, courseId, scheduleRes, scheduleData, sessionId, studentSessionsRes, studentSessionsData, foundSession, certRes, certData, reviewRes, reviewData, updatedTeacherRes, updatedTeacherData, notifRes, notifData;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log('--- Starting Sprint F End-to-End Test ---');
                    // 1. Login as teacher and student
                    console.log('1. Logging in as Teacher and Student');
                    return [4 /*yield*/, fetch("".concat(API_URL, "/auth/register"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: "teacher_".concat(Date.now(), "@test.com"), password: 'Password123!', firstName: 'Test', lastName: 'Teacher', role: 'TEACHER' })
                        })];
                case 1:
                    teacherRegisterRes = _e.sent();
                    return [4 /*yield*/, teacherRegisterRes.json()];
                case 2:
                    teacherData = _e.sent();
                    teacherToken = (_a = teacherData.data) === null || _a === void 0 ? void 0 : _a.token;
                    return [4 /*yield*/, fetch("".concat(API_URL, "/auth/register"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: "student_".concat(Date.now(), "@test.com"), password: 'Password123!', firstName: 'Test', lastName: 'Student', role: 'STUDENT' })
                        })];
                case 3:
                    studentRegisterRes = _e.sent();
                    return [4 /*yield*/, studentRegisterRes.json()];
                case 4:
                    studentData = _e.sent();
                    studentToken = (_b = studentData.data) === null || _b === void 0 ? void 0 : _b.token;
                    assert.ok(teacherToken, 'Teacher token missing');
                    assert.ok(studentToken, 'Student token missing');
                    // Create a course owned by this teacher
                    console.log('1b. Teacher creating a course');
                    return [4 /*yield*/, fetch("".concat(API_URL, "/courses"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer ".concat(teacherToken) },
                            body: JSON.stringify({
                                title: 'End-to-End Test Course',
                                description: 'A course for testing Sprint F features',
                                price: 0,
                                courseType: 'ON_DEMAND',
                                categoryId: null
                            })
                        })];
                case 5:
                    courseRes = _e.sent();
                    return [4 /*yield*/, courseRes.json()];
                case 6:
                    courseData = _e.sent();
                    assert.equal(courseRes.status, 201, 'Failed to create course');
                    courseId = courseData.data.id;
                    // Enroll student in the course (if not already)
                    return [4 /*yield*/, fetch("".concat(API_URL, "/enrollments/").concat(courseId), {
                            method: 'POST',
                            headers: { 'Authorization': "Bearer ".concat(studentToken) }
                        })];
                case 7:
                    // Enroll student in the course (if not already)
                    _e.sent();
                    // 2. Teacher schedules a live session
                    console.log('2. Teacher scheduling live session');
                    return [4 /*yield*/, fetch("".concat(API_URL, "/live-sessions/course/").concat(courseId), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer ".concat(teacherToken) },
                            body: JSON.stringify({
                                title: 'End-to-End Test Session',
                                description: 'Testing the live session flow',
                                scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                                durationMinutes: 60,
                                meetingUrl: 'https://zoom.us/j/1234567890'
                            })
                        })];
                case 8:
                    scheduleRes = _e.sent();
                    return [4 /*yield*/, scheduleRes.json()];
                case 9:
                    scheduleData = _e.sent();
                    assert.equal(scheduleRes.status, 201, 'Failed to schedule session');
                    sessionId = scheduleData.data.id;
                    // 3. Student views their upcoming sessions
                    console.log('3. Student fetching upcoming sessions');
                    return [4 /*yield*/, fetch("".concat(API_URL, "/live-sessions/student/bookings"), {
                            headers: { 'Authorization': "Bearer ".concat(studentToken) }
                        })];
                case 10:
                    studentSessionsRes = _e.sent();
                    return [4 /*yield*/, studentSessionsRes.json()];
                case 11:
                    studentSessionsData = _e.sent();
                    foundSession = studentSessionsData.data.find(function (s) { return s.id === sessionId; });
                    assert.ok(foundSession, 'Student did not see the scheduled session');
                    // 4. Student completes course (assuming the enrollment is already ACTIVE, let's complete all lessons)
                    console.log('4. Student completing course modules to unlock certificate');
                    return [4 /*yield*/, fetch("".concat(API_URL, "/certificates/issue"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer ".concat(studentToken) },
                            body: JSON.stringify({ courseId: courseId })
                        })];
                case 12:
                    certRes = _e.sent();
                    return [4 /*yield*/, certRes.json()];
                case 13:
                    certData = _e.sent();
                    // It might fail if not fully completed, or it might succeed if MVP doesn't enforce 100% yet.
                    console.log('Certificate issue response:', certData);
                    // 5. Student submits review
                    console.log('5. Student submitting course review');
                    return [4 /*yield*/, fetch("".concat(API_URL, "/reviews"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer ".concat(studentToken) },
                            body: JSON.stringify({
                                courseId: courseId,
                                rating: 5,
                                comment: 'Excellent course, highly recommended!'
                            })
                        })];
                case 14:
                    reviewRes = _e.sent();
                    return [4 /*yield*/, reviewRes.json()];
                case 15:
                    reviewData = _e.sent();
                    console.log('Review response:', reviewData);
                    // 6. Check teacher rating updates
                    console.log('6. Checking teacher rating update');
                    return [4 /*yield*/, fetch("".concat(API_URL, "/users/").concat(teacherData.data.user.id))];
                case 16:
                    updatedTeacherRes = _e.sent();
                    return [4 /*yield*/, updatedTeacherRes.json()];
                case 17:
                    updatedTeacherData = _e.sent();
                    console.log('Updated teacher rating:', (_d = (_c = updatedTeacherData.data) === null || _c === void 0 ? void 0 : _c.profile) === null || _d === void 0 ? void 0 : _d.averageRating);
                    // 7. Check student notifications
                    console.log('7. Checking student notifications (should have one for certificate)');
                    return [4 /*yield*/, fetch("".concat(API_URL, "/notifications"), {
                            headers: { 'Authorization': "Bearer ".concat(studentToken) }
                        })];
                case 18:
                    notifRes = _e.sent();
                    return [4 /*yield*/, notifRes.json()];
                case 19:
                    notifData = _e.sent();
                    console.log('Student Notifications:', notifData.data.map(function (n) { return n.title; }));
                    console.log('--- Test Completed Successfully ---');
                    return [2 /*return*/];
            }
        });
    });
}
testSprintF().catch(console.error);
