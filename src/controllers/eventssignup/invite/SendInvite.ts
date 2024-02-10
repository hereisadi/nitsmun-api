import { Response } from "express";
import { AuthRequest } from "../../../utils/types/AuthRequest";
import { verifyToken } from "../../../middlewares/VerifyToken";
import { User } from "../../../models/localAuthentication/User";
import crypto from "crypto";
import { sendEmail } from "../../../utils/EmailService";

export const sendInvite = async (req: AuthRequest, res: Response) => {
  verifyToken(req, res, async () => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // ! don't separate eventName with space
      let { email, eventName, grpName } = req.body as {
        email: string;
        eventName: string;
        grpName: string;
      };

      if (!email) {
        return res.status(400).json({
          error: "email required to send invite to join team",
        });
      }

      if (!eventName) {
        return res.status(400).json({
          error: "event name required to send invite to join team",
        });
      }

      if (!grpName) {
        return res.status(400).json({
          error: "grp name required to send invite to join team",
        });
      }

      email = email.trim().toLowerCase();
      eventName = eventName.trim();
      // eventName = encodeURIComponent(eventName)
      grpName = grpName.trim();
      // grpName = encodeURIComponent(grpName)

      if (email === user.email) {
        return res.status(400).json({ error: "grpLeader can't be the member" });
      }

      const inviteLinkUser = await User.findOne({ email: email });
      if (!inviteLinkUser) {
        return res.status(404).json({ error: "User not found, signup first" });
      }

      const whoSendTheInvite = await User.find({ email: user.email });
      if (!whoSendTheInvite) {
        return res
          .status(404)
          .json({ error: "whoSendTheInvite User not found, signup first" });
      }

      const uniqueToken = crypto.randomBytes(48).toString("hex") as string;

      const emailLink = `https://nitsmun.in/registration/invite/${
        user.email
      }/to/${email}/token/${uniqueToken}/${encodeURIComponent(
        eventName
      )}/${encodeURIComponent(grpName)}`;

      sendEmail(
        email,
        `[NITSMUN] Invitation to join ${grpName} by the ${user.name}`,
        `Hi ${inviteLinkUser.name},\n${user.name} has invited you to join their group:${grpName} for the NITSMUN event: ${eventName} in the group: ${grpName}.\nClick on below link to register for the ${eventName} through the invite link:\n ${emailLink}\n\nThanks,\nTeam NITSMUN`
      );

      const filteredInvite = inviteLinkUser.inviteLink.filter(
        (invite) =>
          invite.eventName === eventName &&
          invite.grpLeaderEmail === user.email &&
          invite.grpName === grpName &&
          invite.memberEmail === email
      );

      if (filteredInvite.length > 0) {
        filteredInvite[0].uniqueToken = uniqueToken;
        await inviteLinkUser.save();
        return res
          .status(200)
          .json({ success: true, message: "invite link sent sucessfully" });
      } else {
        const newInvite = {
          grpLeaderEmail: user.email,
          eventName: eventName,
          uniqueToken,
          grpName: grpName,
          memberEmail: email,
        };

        inviteLinkUser.inviteLink.push(newInvite);
        await inviteLinkUser.save();
      }

      const thatArray = whoSendTheInvite[0].sendInviteToWhom.filter(
        (item) => item.eventName === eventName && item.grpName === grpName
      );

      if (thatArray.length > 0) {
        const detailsToPush = {
          email: email,
          hasAccepted: "no",
        };
        thatArray[0].toWhom.push(detailsToPush);
        await whoSendTheInvite[0].save();
      } else {
        const detailsToPush = {
          email: email,
          hasAccepted: "no",
        };
        const newInvite = {
          eventName: eventName,
          grpName: grpName,
          toWhom: [detailsToPush],
        };
        whoSendTheInvite[0].sendInviteToWhom.push(newInvite);
        await whoSendTheInvite[0].save();
      }
      res
        .status(200)
        .json({ success: true, message: "invite link sent sucessfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "something went wrong" });
    }
  });
};
