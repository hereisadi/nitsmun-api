import { Response } from "express";
import { yp } from "../../models/events/yp";
import { CError } from "../../utils/ChalkCustomStyles";
import { verifyToken } from "../../middlewares/VerifyToken";
import { User } from "../../models/localAuthentication/User";
import { AuthRequest } from "../../utils/types/AuthRequest";
import { sendEmail } from "../../utils/EmailService";

// access: private
// method: POST
// desc: register for an event
// role: client
// payload : { payment, eventName, previousMunExperience , committeePreference and portfolioPreference as array} and college only for NITS
// route: /reg/yp

// IMPORTANT NOTE
// for committe preference, there should be a chckbox, where a user can select minimum 1 and maximum 3 committees
// same applies to portfolio preference

// after the successful registration, user should be provided a button to download the registration receipt and background guide of that particular committee

// ! IN FRONTEND, URL SHOULD MUST BE /registration

export const ypController = async (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
    try {
      // console.log(req.body)
      const {
        payment,
        eventName,
        previousMunExperience,
        committeePreference,
        isGroupRegistration,
        portfolioPreference,
      } = req.body as {
        payment: string;
        eventName: string;
        previousMunExperience: string;
        portfolioPreference: string[];
        committeePreference: string[];
        isGroupRegistration: boolean;
      };

      let { inviteToken, grpLeaderEmail, memberEmail, eventNameIn, grpName } =
        req.body as {
          inviteToken: string;
          grpLeaderEmail: string;
          memberEmail: string;
          eventNameIn: string;
          grpName: string;
        };

      inviteToken = inviteToken?.trim();
      memberEmail = memberEmail?.trim().toLowerCase();
      grpLeaderEmail = grpLeaderEmail?.trim().toLowerCase();
      eventNameIn = decodeURIComponent(eventNameIn);
      grpName = decodeURIComponent(grpName);

      // if (inviteToken === undefined || inviteToken === null) {
      if (!inviteToken) {
        // ! THIS REGISTRATION ONLY FOR NON INVITE LINKS
        if (isGroupRegistration === false) {
          // ! INDIVIDUAL REGISTRATION
          if (!eventName || !previousMunExperience) {
            return res
              .status(400)
              .json({ error: "Please fill all required fields" });
          }

          if (
            committeePreference.length < 1 ||
            committeePreference.length > 3
          ) {
            return res
              .status(400)
              .json({ error: "invalid committee selection" });
          }

          if (
            portfolioPreference.length < 1 ||
            portfolioPreference.length > 9
          ) {
            return res
              .status(400)
              .json({ error: "invalid portfolio selection" });
          }

          const userId = req.user?.userId;
          if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
          }

          const user = await User.findById(userId);

          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }

          const { email, name, role, isVerified, isStudentOfNITS, phone } =
            user;

          // check if that email exists for that eventName if yes, then decline the registration
          const existingSignup = await yp.findOne({ email, eventName });
          // const indexes = await yp.collection.getIndexes();
          // console.log(indexes);

          if (existingSignup) {
            return res.status(400).json({
              error: `Signup with this email for the event already exists`,
            });
          } else {
            console.log(
              `Signup with this ${email} for the event ${eventName} does not exists in the schema`
            );
          }

          // console.log(existingSignup);

          if (role === "client") {
            if (isVerified === true) {
              if (isStudentOfNITS === false) {
                let { college, accomodation } = req.body as {
                  college: string;
                  accomodation: string;
                };
                if (!college || !accomodation) {
                  return res
                    .status(400)
                    .json({ error: "Please fill all required fields" });
                }
                college = college?.trim();
                accomodation = accomodation?.trim();

                const eventsignup = new yp({
                  name,
                  email,
                  payment,
                  phone,
                  eventName,
                  college,
                  previousMunExperience,
                  committeePreference,
                  portfolioPreference,
                  accomodation,
                  isGroupRegistration: false,
                  grpName: null,
                });

                await eventsignup.save();

                sendEmail(
                  email,
                  `[NITSMUN] ${eventName} Registration Completed`,
                  `Hi ${user.name},\n
                Congratulations, You have successfully registered for the ${eventName}. \n
                \n\n Team NITSMUN`
                );
                res.status(200).json({
                  message: "Event registration completed",
                  eventsignup,
                });
              } else if (isStudentOfNITS === true) {
                const eventsignup = new yp({
                  name,
                  email,
                  payment,
                  eventName,
                  college: "NIT Silchar",
                  previousMunExperience,
                  phone,
                  scholarid: user.scholarID,
                  batch: user.year,
                  committeePreference,
                  portfolioPreference,
                  isGroupRegistration: false,
                  grpName: null,
                });

                await eventsignup.save();
                sendEmail(
                  email,
                  `[NITSMUN] ${eventName} Registration Completed`,
                  `Hi ${user.name},\n
                Congratulations, You have successfully registered for the ${eventName}. \n
                \n\n Team NITSMUN`
                );
                res.status(200).json({
                  message: "Event registration completed",
                  eventsignup,
                });
              }
            } else {
              return res.status(401).json({
                error: "You need to verify your email first",
              });
            }
          } else {
            return res.status(401).json({
              error:
                "Admins and SuperAdmins are not allowed to register for an event",
            });
          }
        } else {
          // ! THIS IS GRP LEADER REGISTRATION, GRP MEMBERS WILL REGISTER AS INDIVIDUAL REGISTRATION
          // group registration of event goes here.

          // checking if logged in user exist or not
          const userId = req.user?.userId;
          if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
          }

          const user = await User.findById(userId);

          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
          const { grpName, grpMembers } = req.body as {
            grpName: string;
            grpMembers: string[];
          };

          if (!grpName) {
            return res.status(400).json({ error: "grpName is missing" });
          }

          if (grpMembers?.length < 1) {
            return res.status(400).json({
              error: "Minimum 1 member is required for group registration",
            });
          }

          // check if the teamMember has signed up or not
          for (let i = 0; i < grpMembers.length; i++) {
            const member = await User.findOne({ email: grpMembers[i] });
            if (!member) {
              return res
                .status(404)
                .json({ error: `User with email ${grpMembers[i]} not found` });
            }
          }
          // check if grpMember has verified their email or not
          for (let i = 0; i < grpMembers.length; i++) {
            const member = await User.findOne({ email: grpMembers[i] });
            if (member?.isVerified === false) {
              return res.status(400).json({
                error: `email ${grpMembers[i]} has not verified their email`,
              });
            }
          }
          // check if grpMember has already registered as individual registration
          for (let i = 0; i < grpMembers.length; i++) {
            const member = await yp.findOne({
              email: grpMembers[i],
              eventName,
              isGroupRegistration: false,
            });
            if (member) {
              return res.status(400).json({
                error: `${grpMembers[i]} has already registered for the event`,
              });
            }
          }

          const acceptedInvite = await User.findOne({ email: user.email });
          if (!acceptedInvite) {
            return res.status(400).json({
              error: "User not found",
            });
          }
          const EventName = eventName?.trim();
          const GrpName = grpName?.trim();

          if (user.isVerified === true) {
            if (
              isGroupRegistration === true &&
              EventName !== "" &&
              GrpName !== "" &&
              grpMembers.length > 0
            ) {
              const filteredInvite = acceptedInvite.registrationInvite.filter(
                (invite) =>
                  invite.eventName === EventName && invite.grpName === GrpName
              );

              if (filteredInvite.length > 0) {
                const teamMembers = filteredInvite[0].grpMembers;
                for (let i = 0; i < grpMembers.length; i++) {
                  if (!teamMembers.includes(grpMembers[i])) {
                    return res.status(400).json({
                      error: `${grpMembers[i]} has not registered for the event`,
                    });
                  }
                }
              }

              // find existing registration
              const existingRegistration = await yp.findOne({
                grpLeaderEmail: user.email,
                eventName: EventName,
                grpName: GrpName,
              });

              if (existingRegistration) {
                return res.status(400).json({
                  error: "You have already registered for this event",
                });
              } else {
                if (user.isStudentOfNITS === false) {
                  let { college, accomodation } = req.body as {
                    college: string;
                    accomodation: string;
                  };
                  if (!college || !accomodation) {
                    return res
                      .status(400)
                      .json({ error: "Please fill all required fields" });
                  }
                  college = college?.trim();
                  accomodation = accomodation?.trim();
                  const eventRegistration = new yp({
                    grpName: GrpName,
                    grpLeaderEmail: user.email,
                    payment,
                    eventName,
                    name: user.name,
                    email: user.email,
                    college,
                    previousMunExperience,
                    committeePreference,
                    portfolioPreference,
                    phone: user.phone,
                    accomodation,
                    isGroupRegistration: true,
                    grpMembers,
                  });

                  await eventRegistration.save();
                  // ! send Email to grpLeader as well as to grpMembers
                  // to grp leader
                  sendEmail(
                    user.email,
                    `[NITSMUN] ${eventName} Registration Completed for the group ${GrpName}`,
                    `Hi ${user.name},\n
                  Congratulations, Your group: ${GrpName} have been successfully registered for the ${eventName}.
                  \n\n Your group: ${GrpName} members are ${grpMembers.join(
                      ", "
                    )}
                  \n\n Team NITSMUN`
                  );

                  // send email to grpMembers
                  for (let i = 0; i < grpMembers.length; i++) {
                    sendEmail(
                      grpMembers[i],
                      `[NITSMUN] ${eventName} Registration Completed for ${GrpName} by ${user.name}`,
                      `Hi, \n
                      Congratulations, You have been successfully registered for the ${eventName} as a group member of ${GrpName}.
                      \n\n Your group leader is ${user.name}
                      \n\n Team NITSMUN`
                    );
                  }
                  return res.status(200).json({
                    success: true,
                    message: "Event registration completed",
                  });
                } else if (user.isStudentOfNITS === true) {
                  const eventsignup = new yp({
                    grpName: GrpName,
                    grpLeaderEmail: user.email,
                    name: user.name,
                    email: user.email,
                    payment,
                    eventName,
                    college: "NIT Silchar",
                    previousMunExperience,
                    phone: user.phone,
                    scholarid: user.scholarID,
                    batch: user.year,
                    committeePreference,
                    portfolioPreference,
                    isGroupRegistration: true,
                    grpMembers,
                  });

                  await eventsignup.save();

                  // ! send Email to grpLeader as well as to grpMembers
                  // to grp leader
                  sendEmail(
                    user.email,
                    `[NITSMUN] ${eventName} Registration Completed`,
                    `Hi ${user.name},\n
                  Congratulations, Your group: ${GrpName} have been successfully registered for the ${eventName}.
                  \n\n Your group: ${GrpName} members are ${grpMembers.join(
                      ", "
                    )}
                  \n\n Team NITSMUN`
                  );

                  // send email to grpMembers
                  for (let i = 0; i < grpMembers.length; i++) {
                    sendEmail(
                      grpMembers[i],
                      `[NITSMUN] ${eventName} Registration Completed for ${GrpName} by ${user.name}`,
                      `Hi, \n
                      Congratulations, You have been successfully registered for the ${eventName} as a group member of ${GrpName}.
                      \n\n Your group leader is ${user.name}
                      \n\n Team NITSMUN`
                    );
                  }
                  return res.status(200).json({
                    success: true,
                    message: "Event registration completed",
                  });
                }
              }
            } else {
              return res.status(400).json({ error: "fill all fields" });
            }
          } else {
            return res
              .status(400)
              .json({ error: "not verified, so can't register" });
          }
        }
      } else {
        // ! THIS IS GRP MEMBER REGISTRATION WITH THE  UNIQUE TOKEN FROM PARAMS
        const userId = req.user?.userId;
        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await User.findById(userId);

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        if (
          !grpLeaderEmail ||
          !memberEmail ||
          !eventNameIn ||
          !grpName ||
          !inviteToken
        ) {
          return res.status(404).json({ error: "where are the details" });
        }

        const grpLeader = await User.findOne({ email: grpLeaderEmail });
        if (!grpLeader) {
          return res.status(404).json({ error: "Team Leader not found" });
        }

        const grpMember = await User.findOne({ email: memberEmail });
        if (!grpMember) {
          return res.status(404).json({ error: "Team Member not found" });
        }

        const filteredInvite = grpMember.inviteLink.filter(
          (invite) =>
            invite.grpLeaderEmail === grpLeaderEmail &&
            invite.eventName === eventNameIn &&
            invite.grpName === grpName
        );

        const thatArrayWhichContainAllInvite =
          grpLeader.sendInviteToWhom.filter(
            (item) => item.eventName === eventNameIn && item.grpName === grpName
          );

        const filtertedArrayOfTeamMembers = grpLeader.registrationInvite.filter(
          (invite) =>
            invite.eventName === eventNameIn && invite.grpName === grpName
        );

        if (filteredInvite?.length > 0) {
          const uniqueToken = filteredInvite[0].uniqueToken;
          if (!uniqueToken) {
            return res.status(400).json({ error: "Invite link not found" });
          }
          if (uniqueToken !== inviteToken) {
            return res.status(400).json({ error: "Invalid token" });
          } else {
            if (thatArrayWhichContainAllInvite?.length > 0) {
              const thatEmailArray = [];
              for (
                let i = 0;
                i < thatArrayWhichContainAllInvite[0].toWhom.length;
                i++
              ) {
                if (
                  thatArrayWhichContainAllInvite[0].toWhom[i].email ===
                  memberEmail
                ) {
                  thatEmailArray.push(
                    thatArrayWhichContainAllInvite[0].toWhom[i]
                  );
                }
              }
              console.log(thatEmailArray[0]);
              if (
                thatEmailArray[0].hasAccepted === "no" &&
                thatEmailArray[0].email === memberEmail
              ) {
                thatEmailArray[0].hasAccepted = "yes";
              } else {
                return res
                  .status(400)
                  .json({ error: "You have already accepted the invite" });
              }
              await grpLeader.save();
            }

            if (filtertedArrayOfTeamMembers.length > 0) {
              if (
                !filtertedArrayOfTeamMembers[0].grpMembers.includes(memberEmail)
              ) {
                filtertedArrayOfTeamMembers[0].grpMembers.push(memberEmail);
                await grpLeader.save();
              } else {
                return res.status(400).json({
                  error: `${memberEmail} already accepted as a team member in ${grpName} with the team leader ${grpLeaderEmail}`,
                });
              }
            } else {
              const memberEmailArray = [memberEmail];
              const newMember = {
                eventName: eventNameIn,
                grpMembers: memberEmailArray,
                grpName: grpName,
                hasRegisteredForTheEvent: "yes",
              };
              grpLeader.registrationInvite.push(newMember);
              await grpLeader.save();
            }
          }
        }

        // ! do the registration thing below

        if (user.isVerified === true) {
          if (user.isStudentOfNITS === false) {
            let { college, accomodation } = req.body as {
              college: string;
              accomodation: string;
            };
            college = college?.trim();
            accomodation = accomodation?.trim();
            const eventsignup = new yp({
              name: user.name,
              email: user.email,
              payment: "not applicable",
              phone: user.phone,
              eventName,
              college,
              previousMunExperience,
              committeePreference,
              portfolioPreference,
              grpName: grpName,
              accomodation,
              isGroupRegistration: true,
              grpLeaderEmail: grpLeaderEmail,
              memberEventRegistrationStatus: "done but not confirmed",
            });

            await eventsignup.save();

            sendEmail(
              user.email,
              `[NITSMUN] ${eventName} Registration Completed`,
              `Hi ${user.name},\n
              Congratulations, You have successfully registered for the ${eventName} under the group: ${grpName} \n
              Your registration is currently provisional and will be confirmed only when group leader completes his/her registration.\n\nYour group name is: ${grpName} and group leader is: ${grpLeaderEmail}
              \n You will receive another email, when your group leader completes his registration.\n\nFor any general query Contact: Ronak Jain (+918402822820)\nFor any registration related issues Contact: Aditya (+918210610167)
              \n\n Team NITSMUN`
            );
            res
              .status(200)
              .json({ message: "Event registration completed", eventsignup });
          } else if (user.isStudentOfNITS === true) {
            const eventsignup = new yp({
              name: user.name,
              email: user.email,
              payment: "not applicable",
              eventName,
              college: "NIT Silchar",
              previousMunExperience,
              phone: user.phone,
              scholarid: user.scholarID,
              batch: user.year,
              committeePreference,
              portfolioPreference,
              grpName: grpName,
              grpLeaderEmail: grpLeaderEmail,
              memberEventRegistrationStatus: "done but not confirmed",
              isGroupRegistration: true,
            });

            await eventsignup.save();
            sendEmail(
              user.email,
              `[NITSMUN] ${eventName} Registration Completed`,
              `Hi ${user.name},\n
              Congratulations, You have successfully registered for the ${eventName} under the group: ${grpName} \n
              Your registration is currently provisional and will be confirmed only when group leader completes his/her registration.\n\nYour group name is: ${grpName} and group leader is: ${grpLeaderEmail}
              \n You will receive another email, when your group leader completes his/her registration.\n\nFor any general query Contact: Ronak Jain (+918402822820)\nFor any registration related issues Contact: Aditya (+918210610167)
              \n\n Team NITSMUN`
            );

            return res.status(200).json({
              success: true,
              message: "Event registration completed",
            });
          }
        } else {
          return res.status(401).json({ error: "verify email first" });
        }
        // return res.status(200).json({
        //   success: true,
        //   message: "Event registration completed",
        // });
      }
    } catch (e) {
      console.error(e);
      CError("Failed to register");
      return res
        .status(500)
        .json({ error: "Something went wrong on the server side" });
    }
  });
};
