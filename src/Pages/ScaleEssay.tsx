import "../Styling/Essay.css";
import { PayUSDCButton } from "./PayUSDCButton";

function ScaleEssay() {
  return (
    <div className="essay-container">
      <p className="essay-title">On the Scale of Networks</p>
      <p className="date">February 21, 2025</p>

      <p>
        I’ve recently become concerned that Ethereum’s decentralization priority
        may always stand in the way of the network’s scale being competitive
        with rival networks. I say this while strongly believing in the value
        and long-term importance of decentralization, however, most normie users
        won’t care about decentralization if it comes at the cost of longer
        transaction times and greater transaction fees. The most popular use
        case of Solana's speedy & high throughput network right now is trading
        memecoins, and for this, some people in the Ethereum community still
        underestimate Solana as a competitor. But I think it is important to
        understand that the memecoin traders selected Solana by the same
        criteria that most users onboarding into crypto are going to decide what
        chain to use: fee costs & transaction speeds. The launch of the Trump &
        Melania memecoins created a major stress test for Solana, and despite
        the struggles of the Solana network to meet this usage demand, we all
        know that this launch would not have been possible on the Ethereum
        network, period. It is widely understood that Solana is currently the
        better scaled blockchain in comparison to the Ethereum L1, but I want to
        figure out what exactly that means. The purpose of this write-up is to
        define the metrics that determine scalability, compare the differences
        in these metrics between Ethereum and Solana, analyze the tradeoffs
        taken to achieve that scalability, and understand the outlook of the
        scaling road ahead. Obviously Ethereum has prioritized decentralization
        over scaling for the moment, but do Ethereum and its Layer 2’s have the
        ability to catch up to Solana? How far behind are they right now and
        what would it look like for them to catch Solana?
      </p>

      <PayUSDCButton>
        <p>
          The scale of a blockchain network can be defined by the network’s
          speed and throughput. Speed is the sum of latency time + finality
          time, where latency is the length of time from when a transaction is
          submitted to when the transaction is included in a block and finality
          time is the time after a transaction is included in a block until a
          user can be sure their transaction is irreversible (my definition if
          speed is analagous to the amount of time it takes from when you twist
          the knob of a hose's spigot until water starts coming out the end of
          the hose). Throughput can be defined as the capacity of transactions
          on the network, most commonly measured by transactions per second
          (throughput is analagous to the quantity of water that comes out of a
          hose in a fixed amount of time). Additionally, the cost of
          transactions can be derived from the throughput of a network. When a
          network is nearing its maximum throughput, the limited space on the
          blockchain forces users to compete to get their transactions included
          by bidding with higher fees. Conversely, if the network's capacity
          greatly exceeds its usage, fees tend to remain low.
        </p>

        <p>
          The important thing to understand is that all scaling metrics are tied
          together. For example, if chain A has a new block every 10 seconds
          with a block size that fits 1000 transactions, and chain B has a new
          block every 1 second with a block size that fits 10 transactions, just
          comparing block times or block sizes will not show the whole picture.
          Chain A will have a greater throughput and be able handle more
          transactions when facing greater demand for usage, while chain B will
          likely have lower latency to get a transaction included in a block
          when the network is facing low demand. Additionally, when considering
          the Ethereum ecosystem, it is important to compare metrics from the L1
          and L2. L2 scaling metrics will be much better than L1 scaling
          metrics, coming at the detriment of other factors such as
          interoperability & security.
        </p>

        <div className="image-container">
          <img
            src="/analytics.png"
            alt="Eth L1 vs Sol L1 scalability comparison"
          />
          <p className="image-caption">
            Fig. 1: Statistics comparing Ethereum L1 to Solana from
            https://chainspect.app/compare/solana-vs-ethereum
          </p>
        </div>
        <div className="image-container">
          <img
            src="/analytics2.png"
            alt="Eth L1 vs Sol L1 scalability comparison"
          />
          <p className="image-caption">
            Fig. 2: Statistics comparing top Ethereum Layer 2’s to Solana.{" "}
          </p>
        </div>

        <p>
          The above graphs display that Solana is head and shoulders above the
          competition from Ethereum, but before we declare Solana the winner,
          let’s consider performance of the aggregate L1 and L2 ecosystem. The
          Ethereum architecture is built for some users to utilize the L1 and
          other users utilize the various L2’s at the same time, so a more
          accurate representation of the Ethereum network’s scale considers the
          performance of the combination of the L1 and L2’s. We could get a
          theoretical maximum throughput across L2’s and the L1 by simply
          summing all of their individual maximum throughputs, however, this
          would overestimate what is possible in reality because L2’s are
          constrained by data availability (L1 blob space). In simpler terms,
          L2’s have a limited amount of space on the L1 to post their
          transactions, if we maxed out usage of all of the L2’s, there would
          not be enough L1 blob space to post all of these transactions,
          resulting in longer settlement times and greater fees. So even if we
          stacked all of the L2 throughput bars from the previous graphs on top
          of each other, it would be an overestimate and still wouldn’t touch
          Solana. Additionally, block time and finality remain unchanged when
          considering the entirety of the L2 ecosystem and the L1, except when
          we consider extreme network congestion which results in finality time
          increasing (as it would for all blockchains).
        </p>

        <p>
          The Ethereum L2 ecosystem does have additional caveats. Ethereum is
          aiming to continue scaling blob space, there are currently 3 blobs per
          a slot (using the entirety of this blob space should result in a total
          of ~210 L2 tx/s) and the looming Pectra upgrade scheduled for March is
          planning to double this blob count. Even further in the future,
          Ethereum has plans to continue to scale data availability with PeerDAS
          & 2D sampling. Vitalik claims that these improvements along with
          improvements to data compression should allow Ethereum to reach
          100,000 tps. Ultimately, the question is not if but when Ethereum can
          make these improvements reality.
        </p>

        <p>
          The speed at which this Ethereum roadmap is executed is a key
          question. L2 transaction fees are beginning to occasionally spike due
          to blob space constraints, the steady increase of blob space will
          partially help resolve this. However, as this crypto cycle heats up,
          this rate of increasing blob space will likely be far outpaced by the
          increase in demand for blob space over (at least) the next one to two
          years. This leads to my personal hypothesis that modular rollups,
          which are rollups using alternative data availability layers such as
          Celestia or EigenDa instead of the Ethereum L1, will gain a lot of
          attention and users over the next one to two years. Essentially,
          modular rollups are not constrained by blob space because they only
          post a state root to the Ethereum L1 while posting their transaction
          data to a specialized DA layer that is separate from the Ethereum L1
          (no reliance on blobs leads to a much smaller portion of the rollup’s
          transaction cost coming from Ethereum). The greatest bottleneck to L2
          performance and cost comes from data availability. Highly specialized
          DA layers can mitigate this bottleneck, at the cost of security
          (notice, every architecture choice creates tradeoffs!). Ethereum is a
          very safe (although generally slower and more expensive) place to post
          transaction data, any other DA layer will offer less cryptoeconomic
          security and unsafe offramps. When L2 fees skyrocket, the modular
          rollup pastures may begin to look far greener.
        </p>

        <p>
          The logical question that may come to mind after all of this L2 and
          data availability talk is: why doesn’t Ethereum just have bigger &
          faster blocks? Obviously, bigger and faster blocks would lead to more
          transactions per a second on Ethereum with lower fees. But, it will
          come at the cost of Ethereum’s day one goal to, “build a global,
          censorship-resistant permissionless blockchain”. At a high level,
          bigger + faster blocks result in fewer people able to run nodes or
          validate transactions, this centralization of block creation +
          validation creates a long term security risk to the integrity of a
          blockchain. Solana has willingly taken this risk, and so far this
          strategy has been successful.
        </p>

        <p>
          High performance hardware requirements, proof of history,
          parallelization, and high capacity networking have forged Solana into
          a highly performant, monolithic L1. All of these attributes of the
          Solana blockchain comprise a ‘vertical scaling’ strategy that doubles
          down on increasing the capacity & speed of the Solana L1 by placing
          more responsibility on the performance of validator nodes. Based on
          various sources, the cost of the hardware necessary to set up a
          validator is in the range of several thousands while the annual cost
          to maintain this hardware is also in the range of several thousands.
          By comparison, an Ethereum validator can run on a lot of regular
          laptops. This expensive hardware to run a Solana validator is
          necessary due to the complex nature of the consensus and transaction
          processing on the blockchain.
        </p>

        <p>
          Solana’s consensus is based on proof of history, a mechanism that
          builds timestamps into the blockchain to eliminate much of the
          messaging required for coordinating an order of transactions and
          leader election. This timestamping supports parallel execution of
          transactions. Parallel execution is a simple computer science concept
          which is analogous to the real world example of a plumbing system that
          uses multiple pipes instead of just one pipe to move the same amount
          of water from point A to point B, allowing more water to flow through
          the system in the same period of time. With Solana, validators use
          multiple separate CPU’s to process transactions that don't touch the
          same accounts or data at the same time, rather than sequentially. This
          allows for processing more transactions over the same period of time
          than if the blockchain was not parallelized, at the cost of requiring
          more compute. Another key component of Solana’s vertical scaling
          strategy is high-capacity networking. To sustain its high-speed
          execution and transaction throughput, Solana requires high-bandwidth
          internet connections for validators. Solana validators must be capable
          of handling rapid block propagation and massive data throughput.
          High-frequency block production (~400–600 ms block times) and large
          transaction volumes place substantial demands on validator
          infrastructure, necessitating fast internet speeds and low-latency
          connections to avoid missing slots in the consensus process.
        </p>

        <p>
          However, this reliance on ultra-fast networking introduces stability
          challenges. Solana’s design prioritizes throughput over redundancy,
          which has led to periodic network congestion and outages when
          transaction volumes spike dramatically. One of the most well-known
          instances occurred during peak memecoin trading mania, when extreme
          transaction loads caused validators to struggle with block
          propagation, leading to network stalls and eventual restarts. While
          Ethereum’s modular rollup architecture allows individual L2s to
          experience congestion independently without affecting the L1, Solana’s
          monolithic structure means that when the L1 is overloaded, the entire
          chain can become unstable.
        </p>

        <p>
          Recognizing these risks, the Solana development team has been working
          on solutions to improve network resilience. One such improvement is
          local fee markets, a mechanism that prioritizes transactions at the
          account or contract level rather than forcing the entire network’s
          fees to spike under congestion. Additionally, optimized block
          propagation techniques aim to prevent validators from being
          overwhelmed by transaction floods, helping to reduce downtime and
          improve reliability. While these solutions have helped mitigate some
          of Solana’s past stability issues, the fundamental tradeoff between
          speed and decentralization remains—the network’s reliance on powerful
          validators and high-bandwidth connections continues to be a
          double-edged sword.
        </p>

        <p>
          Ultimately, Solana’s high-performance networking and parallelized
          execution allow it to achieve unparalleled speed and throughput, but
          at the cost of accessibility for node operators and long-term
          decentralization risks. In analyzing Solana’s scalability, the next
          logical question is whether these tradeoffs are sustainable in the
          long run—or whether Ethereum’s rollup-based approach, despite its
          current lag in raw throughput, may ultimately prove to be the more
          robust model for scaling blockchains.
        </p>

        <div style={{ marginTop: "500px" }}></div>

        <p>
          *****The discussions around security and decentralization along with
          their effects on the utility, safety, and trust in a blockchain
          deserve more detailed analysis than the simple remarks I made in this
          essay. This is best expressed by Mike Neuder, who says
          <a
            href="https://hackmd.io/@mikeneuder/ethesis"
            target="_blank"
            rel="noopener noreferrer"
          >
            “Any compromise on decentralization opens an attack surface for
            regulatory or corporate capture, fundamentally limiting the market
            opportunity of a digital property rights system.”
          </a>
          Ethereum is immutable (with extremely high probability), while Solana
          can be tampered with. This creates serious implications to consider
          when trusting a blockchain to run meaningful applications or store
          meaningful amounts of wealth.*****
        </p>

        <p>
          *****One of my key takeaways from doing this research is the
          following: Say you gave the average crypto enthusiast the following
          power: with the snap of your fingers, you could permanently wipe away
          the entire legacy banking infrastructure, forcing everyone to move
          on-chain. I believe most people in our industry would decide to snap
          their fingers. However, I think most people don’t realize how far away
          blockchains are from being able to handle that quantity of people with
          reasonable fees and transaction speeds. At the moment, even the
          parallel executing, highly performant Solana nodes that comprise the
          Solana blockchain can’t handle high profile memecoin launches.
          Ethereum has a roadmap to reach 100,000 tps, but Ethereum is currently
          nowhere near that scale.*****
        </p>
      </PayUSDCButton>
    </div>
  );
}

export default ScaleEssay;
