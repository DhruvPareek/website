import "../Styling/Essay.css";

function QMDBEssay() {
  return (
    <div className="essay-container">
      <p className="essay-title">QMDB for Noobs</p>
      <p className="date">January 2026</p>
      <br />
      <p>
        At their core, blockchains are software programs that replicate the state of a network 
        across many independent computers which may not trust each other. Each time the state 
        advances (via appending new transactions to the blockchain), nodes must verify every 
        transaction against the current state and then apply the resulting state changes. If I 
        attempt to spend 1 ETH, participants on the network must produce & verify a proof of the part of the state that contains my account. 
        Each network node's ability to store state, serve proofs of this state, and verify the 
        state in a timely manner (known as executing "Performant Data Authentication") creates 
        limitations on the network's scaling capacity.
      </p>
      <br />
      <p className="quote">
        "Decentralized systems require the ability to prove authenticity of data received from 
        potentially untrustworthy sources." — <a 
          href="https://commonware.xyz/blogs/mmr#:~:text=Decentralized%20systems%20require%20the%20ability%20to%20prove%20authenticity%20of%20data%20received%20from%20potentially%20untrustworthy%20sources." 
          target="_blank" 
          rel="noopener noreferrer"
        >Merkle Mountain Ranges for Performant Data Authentication</a>
      </p>
      <br />
      <p>
        For the same standard of hardware, a node that performs data authentication in memory, 
        i.e. does fewer SSD lookups, can scale to execute far more transactions than a node that 
        does not. How can nodes take advantage of speedy memory accesses and reduce SSD lookups? 
        They can either buy expensive machines with more memory or use efficient data structures 
        that make authentication cheaper. At the moment, the standard data structure 
        used by most blockchains is a variation of a <a href="https://en.wikipedia.org/wiki/Merkle_tree" target="_blank" rel="noopener noreferrer">Merkle Tree</a>, for example <a href="https://ethereum.org/developers/docs/data-structures-and-encoding/patricia-merkle-trie/" target="_blank" rel="noopener noreferrer">Ethereum's Merkle-Patricia-Trie</a>. But as you will see, these have several inefficiencies 
        which motivates a search for a better option.
      </p>
      <br />
      <p>
        Through some clever innovations and modifications to existing merkle tree variants, 
        LayerZero created the Quick Merkle Database (QMDB) which significantly improves the 
        performance of data authentication in comparison to existing data structures. QMDB's key breakthrough 
        is that the sections of the data structure relevant to new 
        updates/writes are compacted into a smaller contiguous space mostly held in 
        memory. This allows us to do fast writes to QMDBs with minimal write amplification, whereas writes to other variants of 
        merkle trees incur a large cost in SSD accesses (relevant portions of the tree that need 
        to be updated are more scattered in SSD + memory). A blockchain that stores state via QMDB 
        theoretically enables nodes to achieve significantly greater throughput than blockchains 
        using alternative data structures.
      </p>
      <br />
      <p>
        This write-up explains how QMDB works and why it is a huge improvement for performant data 
        authentication by building up an understanding of QMDB step by step:
      </p>
      <div className="table-of-contents">
        <div className="toc-title">Contents</div>
        <ol>
          <li><a href="#merkle-mountain-ranges">Merkle Mountain Ranges (MMR)</a></li>
          <li><a href="#mmr-indexer">MMR + an Indexer</a></li>
          <li><a href="#qmdb">QMDB: MMR + an Indexer + an Activity Bitmap</a></li>
          <li><a href="#qmdb-weeds">The QMDB Weeds</a></li>
          <li><a href="#commonware-storage-qmdb">commonware-storage QMDB</a></li>
        </ol>
      </div>
      <br />
      <p>
        I'll assume you already know the basics of merkle trees (merkleization and merkle proofs).
      </p>
      <br />
      <p>
        LayerZero and Commonware implemented variations of these ideas as open-source software, 
        and this post is largely based on Commonware's awesome write-ups plus the LayerZero whitepaper 
        and related Rust crates. My goal here is to stitch those sources into a single, beginner-friendly 
        write-up (with graphics) so you can read end-to-end, understand QMDB from first principles, and 
        still have pointers to the more technical references when you want to go deeper.
      </p>
      <br />
      <p className="section-header">References</p>
      <ul className="reference-list">
        <li>
          <a 
            href="https://commonware.xyz/blogs/mmr" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Merkle Mountain Ranges for Performant Data Authentication (Commonware blog)
          </a>
        </li>
        <li>
          <a 
            href="https://commonware.xyz/blogs/adb-any" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            The Simplest Database You Need (Commonware blog)
          </a>
        </li>
        <li>
          <a 
            href="https://commonware.xyz/blogs/adb-current" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Grafting Trees to Prove Current State (Commonware blog)
          </a>
        </li>
        <li>
          <a 
            href="https://commonware.xyz/blogs/qmdb" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            QMDB All The Things (Commonware blog)
          </a>
        </li>
        <li>
          <a 
            href="https://arxiv.org/pdf/2501.05262" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            QMDB Whitepaper (LayerZero)
          </a>
        </li>
        <li>
          <a 
            href="https://github.com/commonwarexyz/monorepo/tree/main/storage" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            commonware-storage QMDB Implementation
          </a>
        </li>
      </ul>
      <br />

      <p id="merkle-mountain-ranges" className="section-header">Merkle Mountain Ranges</p>
      <p className="sub-reference">
        <a 
          href="https://commonware.xyz/blogs/mmr" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Merkle Mountain Ranges for Performant Data Authentication (Commonware blog)
        </a>
      </p>
      <br />
      <p>
        Traditional merkle trees and their variants store key value pairs as leaves: 
        &#123;account_address → account_data&#125;. Each account corresponds to one leaf where 
        the account data can be smart contract code, smart contract data, balance, etc. After 
        an account executes a transaction, every node in the network will do the 
        computationally expensive process of updating the account data stored in the corresponding 
        leaf of the merkle tree and re-merkleizing the tree (i.e. recompute hashes of the chain 
        of nodes from merkle root to this leaf).
      </p>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig1.png" 
          alt="Merkle tree update visualization"
        />
        <p className="image-caption">
          Fig. 1: An update to the state of account_i represented by the yellow colored leaf 
          requires re-hashing nodes up the tree by accessing blue node values to recalculate 
          each green node's value.
        </p>
      </div>

      <p>
        This merkle tree update & ensuing merkleization of the tree is expensive because a single 
        transaction can touch multiple distant leaves. Then for each leaf, a node must access & update the 
        arbitrary leaf that represents the account involved in the transaction (for example the 
        yellow leaf node in fig. 1) and re-merkleize the tree by recomputing hashes for 
        many internal nodes up to the root node. This write amplification is very costly because it 
        triggers reads/writes across the data structure that involve randomly scattered SSD 
        accesses. A more efficient update method would involve mostly reading from memory and only 
        committing contiguous writes. So how could you do that?
      </p>
      <br />
      <p>
        This is where Merkle Mountain Ranges (MMRs) are useful! An MMR is a collection of merkle 
        trees (where we call each merkle tree a 'mountain') that only allow appending new data, 
        rather than modifying existing leaves. To be more specific:
      </p>
      <br />
      <p className="quote">
        "An MMR is a list of perfect binary trees, called mountains, each of strictly decreasing height."
        — <a 
          href="https://commonware.xyz/blogs/mmr#:~:text=A%20MMR%20is%20a%20list%20of%20perfect%20binary%20trees%2C%20called%20mountains%2C%20each%20of%20strictly%20decreasing%20height." 
          target="_blank" 
          rel="noopener noreferrer"
        >Merkle Mountain Ranges for Performant Data Authentication</a>
      </p>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig2.png" 
          alt="Merkle Mountain Range structure"
        />
        <p className="image-caption">
          Fig. 2: This MMR consists of three mountains (merkle trees) outlined in the red dotted lines. 
          Each update to the variable foo corresponds to appending a new leaf which represents the update.
        </p>
      </div>

      <p>
        Where merkle trees usually represent a key-value pair in a single leaf and update the key's 
        value by updating that same leaf in place, merkle mountain ranges instead append a new leaf 
        to the MMR per update to a key's value. In other words, the MMR acts as a log of operations. As
        an example, a leaf in the log could represent an operation like creating a new variable or updating an existing variable
      </p>
      <br />
      <p>
        MMRs are very easy to maintain. Every update (i.e. appending a new leaf to the data structure), <a 
          href="https://commonware.xyz/blogs/mmr#:~:text=if%20you%20add%20a%20new%20element%20to%20the%20end%20of%20the%20list%2C%20you%20need%20only%20generate%20at%20most%20a%20log2(N)%20number%20of%20new%20internal%20nodes%20to%20re%2Dimpose%20the%20required%20properties%20without%20modifying%20any%20existing%20nodes%2C%20as%20depicted%20in%20Figure%202%20below" 
          target="_blank" 
          rel="noopener noreferrer"
        >"...requires generating at most log₂(N) number of new internal nodes to re-impose the required properties without modifying any existing nodes."</a> In simpler terms, every update results in adding 
        a small number of new internal nodes along the far right side of the MMR and it is not necessary 
        to over-write any existing nodes. Write amplification is now heavily reduced!
      </p>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig3.png" 
          alt="Adding leaves to an MMR"
        />
        <p className="image-caption">
          Fig. 3: This image depicts the process of adding two new leaves to an MMR and the corresponding 
          internal nodes that are also created in the tree.
        </p>
      </div>

      <p>
        Updates to MMRs have two key benefits: (1) minimal reads from storage (only retrieve the values 
        of a few hashes throughout the MMR) and (2) a single contiguous write to storage (write the 
        values of the newly created nodes in the MMR).
      </p>
      <br />
      <p>
        (1) The hashes necessary to re-merkleize after appending an 
        update can be found in locations known ahead of time. Looking at the example from fig. 3, 
        re-merkleizing the tree after appending nodes 12 and 13 only required accessing the root nodes 
        of the other mountains in the MMR.
      </p>
      <br />
      <p>
        (2) Writes are naturally contiguous because the append-only restriction means that new nodes 
        are allocated sequentially in a file/LSM segment. Additionally, the few reads of existing hashes 
        necessary to calculate hashes of newly created nodes is likely small enough to fit entirely 
        in cache/memory.
      </p>
      <br />
      <p className="quote">
        "Contrast this to a standard Merkle tree, where adding or updating an element can require 
        reading and updating a logarithmically sized amount of data scattered randomly across storage."
        — <a 
          href="https://commonware.xyz/blogs/mmr#:~:text=Contrast%20this%20to%20a%20standard%20Merkle%20tree%2C%20where%20adding%20or%20updating%20an%20element%20can%20require%20reading%20and%20updating%20a%20logarithmically%20sized%20amount%20of%20data%20scattered%20randomly%20across%20storage." 
          target="_blank" 
          rel="noopener noreferrer"
        >Merkle Mountain Ranges for Performant Data Authentication</a>
      </p>
      <br />
      <p>
        Another useful feature of MMRs is to prune old/unnecessary leaves in an MMR.
         Since leaves are appended in time order, you can compact the log by discarding old ranges (e.g.,
         everything before an "inactivity floor") and rebuilding a new MMR over the remaining operations.
         The irrelevant/old leaves before the Inactivity Floor can be called inactive leaves, while
          leaves with necessary data can be called active leaves.
      </p>
      <br />
      <p>
        Another useful feature of MMRs is the ability to prune inactive leaves. An operation in the MMR can be 
        classified as inactive if its key has been overwritten, or active if its key hasn't been overwritten. 
        All leaves up to the "Inactivity Floor" can be pruned, where the Inactivity Floor is the leaf index before which all operations are inactive.
      </p>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig4.png" 
          alt="Dropping old leaves from MMR"
        />
        <p className="image-caption">
          Fig. 4: This image depicts the process of dropping old leaves from the MMR and the 
          resulting new MMR.
        </p>
      </div>

      <p>
        In practice, "active" and "inactive" operations may be interleaved. One compaction strategy 
        is to scan from the beginning, discard old operations, and re-append any still-relevant ones 
        to the end, see figure 5.
      </p>
      <br />
      <div className="image-container">
        <img 
          src="/qmdb_fig5.png" 
          alt="Pruning old leaves and replaying operations"
        />
        <p className="image-caption">
          Fig. 5: This image depicts the process of pruning old leaves and replaying operations 
          to append them back to the end of the MMR.
        </p>
      </div>
      <p>
        In a blockchain setting, compaction has to be deterministic. Nodes must agree on when to 
        compact and exactly which operations to replay, otherwise they'll diverge on the root and 
        produce incompatible proofs. Therefore compaction would need some parameters to standardize 
        when it should be run, for example defining either how many inactive leaves are tolerated 
        or how many leaves should be removed at a time.
      </p>
      <br />
      <p>
        There is still an issue with this MMR construction for our needs: it can prove that an 
        operation occurred, but not that it's the latest operation for a given key. For example 
        in figure 5, someone may provide a merkle proof of operation 5 attempting to prove that 
        foo == 4, which looks valid. However, two steps later foo's value is updated again 
        and we would have no idea that foo is no longer equal to 4 since we only validated the 
        merkle proof of operation 5. To find the current value of foo, we need to replay 
        every operation stored in the MMR. Our goal is to create a lightweight authenticated 
        database capable of storing a mutable blockchain's state, this simple MMR 
        doesn't quite satisfy all of our needs.
      </p>
      <br />

      <p id="mmr-indexer" className="section-header">Merkle Mountain Ranges + an Indexer</p>
      <p className="sub-reference">
        <a 
          href="https://commonware.xyz/blogs/adb-any" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          The Simplest Database You Need (Commonware blog)
        </a>
      </p>
      <br />
      <p>
        As a reminder, an MMR is a data structure that allows efficiently proving the inclusion of an 
        element in a growing ordered list. However, to be useful for blockchains, we need a lightweight 
        authenticated database (ADB) capable of storing and proving mutable state efficiently.{' '}
        (<a 
          href="https://commonware.xyz/blogs/adb-any#:~:text=In%20a%20previous,Apache%2D2%20license." 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Reference
        </a>)
      </p>
      <br />
      <p>
        A pretty simple addition to the MMR for efficiently accessing the current value of a key is 
        an indexer. The indexer is a simple hash map from hash(key) to the location 
        of the leaf representing the most recent update for that key.
      </p>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig6.png" 
          alt="MMR with indexer"
        />
        <p className="image-caption">
          Fig. 6: The indexer allows us to easily find the latest value of the key 'foo' since it 
          maps the hash of 'foo' to the 9th leaf in the MMR, which stores the most recent update to 'foo'.
        </p>
      </div>

      <p>
        If the indexer is optimized to fit in memory, or largely in memory, reads become much cheaper 
        because you can jump directly to a key's latest update in the log. However, this indexer isn't 
        directly built into the MMR's merkle proofs. A merkle proof for the value associated with the key 
        'foo' still doesn't prove that it's the most recent update for that key. To create proofs of 
        a key's value along with proof that the value is active requires a little more trickery.
      </p>
      <br />

      <p id="qmdb" className="section-header">QMDB (MMR + an Indexer + an Activity Bitmap)</p>
      <p className="sub-reference">
        <a 
          href="https://commonware.xyz/blogs/adb-current" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Grafting Trees to Prove Current State (Commonware blog)
        </a>
        <br />
        <a 
          href="https://commonware.xyz/blogs/qmdb" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          QMDB All The Things (Commonware blog)
        </a>
      </p>
      <br />
      <p>
        The last piece of this puzzle is to modify the MMR to efficiently prove that a key currently holds 
        a specific value. In other words, the MMR will need to generate proofs that differentiate if 
        data stored in a leaf is 'active' vs 'inactive'. For example, in figure 5, the MMR would need 
        to be able to distinguish that leaves 3 and 6 are inactive while leaf 9 is active (because 
        leaf 9 is the most recent operation on the key 'foo').
      </p>
      <br />
      <p>
        A naive way to implement this functionality would be to create a merkle tree, mirroring our 
        existing MMR, that stores the activity status of each operation (figure 7). In this setup, there 
        is the existing 'Update Log' MMR that stores operations and a new 'Activity Status' Merkle 
        Tree (MT) which uses a unique leaf to represent the activity status of each operation in the 
        Update Log MMR. Now when a key's value is updated:
      </p>
      <ol>
        <li>A new leaf representing the operation is appended to the Update Log MMR.</li>
        <li>A new leaf representing the active status of this operation is appended to the Activity Status Merkle Tree.</li>
        <li>
          The leaf corresponding to the key's previous update is flipped from active to inactive in 
          the Activity Status Merkle Tree.{' '} <br />
          <a 
            href="https://commonware.xyz/blogs/adb-current#:~:text=In%20this%20post,the%20latest%20update." 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Reference
          </a>
        </li>
      </ol>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig7.png" 
          alt="Combined MMR + Merkle Tree structure"
        />
        <p className="image-caption">
          Fig. 7: A combined MMR + Merkle Tree (MT) of identical structure allows proving which value 
          for a given key is current. In this figure the siblings along the two paths from root 
          highlighted in red provide the necessary digests for proving "foo currently has value 6". 
          Leaf X in the MMR is an operation with its activity status stored in leaf X of the merkle 
          tree. In the merkle tree, a leaf value of 0 == 'inactive' while 1 == 'active'.{' '}
          <a 
            href="https://commonware.xyz/blogs/adb-current#:~:text=Figure%202%3A%20A%20combined%20MMR%20%2B%20Merkle%20Tree%20(MT)%20of%20identical%20structure%20allows%20proving%20which%20value%20for%20a%20given%20key%20is%20current.%20In%20this%20figure%20the%20siblings%20along%20the%20two%20paths%20from%20root%20highlighted%20in%20red%20provide%20the%20necessary%20digests%20for%20proving%20%E2%80%9Cfoo%20currently%20has%20value%206%E2%80%9D." 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Reference
          </a>
        </p>
      </div>
      
      <p>
        The root hash of this new data structure comes from tying the peaks of the MMR and MT together. 
        A proof of the current value of foo therefore includes the path to the latest operation at 
        leaf 9 in the Update Log MMR as well as the path to the active bit in the Activity Status MT.
      </p>
      <br />
      <p>
        You may notice that the new Merkle Tree will reintroduce the write amplification problem 
        because updates no longer just append to the MMR. If an existing key's value is updated, we need 
        to flip the activity status bit of the key's previous operation in the MT and re-merkleize 
        the entire tree. This process erases the performance gains that MMRs introduced because the 
        bit representing activity status of the previous update can be located anywhere in the merkle 
        tree and therefore requires randomly scattered reads/writes in storage to re-merkleize.
      </p>
      <br />
      <details className="popout-example">
        <summary>Example: Updating 'bar'</summary>
        <p>
          Say we modify a variable 'bar' that was last updated in operation 5. First we need to 
          flip the activity status bit of operation 5 from 1 to 0, then append the operation modifying 
          'bar' to the 'Update Log' MMR, then append a new 'Activity Status' bit set to 1 to the end of 
          the 'Activity Status' merkle tree. Appending a leaf to the MMR and MT is performant 
          as we have already explained, but flipping the bit in leaf 5 representing operation 5's 
          activity status will require re-merkleizing several internal nodes from storage.
        </p>
      </details>
      <br />
      <p>
        However, this issue can be resolved by compacting the MT to fit in memory. Figure 8 depicts a 
        compacted Activity Status MT that represents the activity status of several leaves in a 
        compressed bitstring.
      </p>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig8.png" 
          alt="Compacted Activity Status Merkle Tree"
        />
        <p className="image-caption">
          Fig. 8: Node 'A' contains the activity status of leaves 1-4 as a 4-digit binary number 
          'xx0x' (the 'x' is for an ambiguous status since those leaves aren't defined in this 
          example image, but you can imagine that the 'x' is supposed to be a 1 or 0), node B 
          contains the activity status for leaves 5-8, and node C contains the activity status 
          for leaves 9-11.
        </p>
      </div>

      <p>
        This compaction technique scales efficiently to support much larger merkle trees. As the 
        Update Log MMR grows with more levels and leaves, nodes like 'A', 'B', and 'C' can simply 
        use longer bitstrings — such as 16, 32, or 64 bits — to act as a bitmap that represents activity 
        of a greater number of operations in the MMR. This allows the MT to represent activity status 
        of a large number of operations without significantly increasing its size. The end result is 
        a Merkle Tree representing the activity status of every operation that can fit entirely in 
        memory, significantly improving the performance of updates and re-merkleization!
      </p>
      <br />
      <p>
        Now we have fast updates to the MMR with minimal write amplification. However, a current-value 
        proof from this data structure could be up to 2x larger because it includes the path to an 
        operation leaf and to an activity status leaf. But this can also be resolved if we maintain the structure of the 
        Activity Status MT to match exactly that of the MMR with its bottom N levels removed. By doing this, we can 
        layer each leaf of the MT onto its corresponding internal node of the MMR.{' '}
        (<a 
          href="https://commonware.xyz/blogs/adb-current#:~:text=As%20described%20above,MMR%20(figure%204)." 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Reference
        </a>)
      </p>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig9.png" 
          alt="Layering MT leaf onto MMR"
        />
        <p className="image-caption">
          Fig. 9: Layering each MT leaf onto its corresponding node in the MMR.
        </p>
      </div>

      <p>
        Generating a proof of an operation includes the same internal nodes in the MMR as before, 
        except it also includes a bitmap which contains the operation's activity bit.{' '}
        (<a 
          href="https://commonware.xyz/blogs/adb-current#:~:text=Generating%20a%20proof,the%20same%20value." 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Reference
        </a>). This structure is now essentially QMDB!
      </p>
      <br />

      <p id="qmdb-weeds" className="section-header">The QMDB Weeds</p>
      <p className="sub-reference">
        <a 
          href="https://arxiv.org/pdf/2501.05262" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          QMDB Whitepaper (LayerZero)
        </a>
      </p>
      <br />
      <p>
        The previous section described QMDB at a high level in casual language, now I'll dive deeper 
        into some details from the QMDB whitepaper with LayerZero's more technical terms.
      </p>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig10.png" 
          alt="Detailed QMDB diagram with technical terms"
        />
        <p className="image-caption">
          Fig. 10: Detailed QMDB diagram labeled with technical terms.
        </p>
      </div>

      <ul className="definition-list">
        <li>
          <strong>Entry:</strong> The primitive data structure in QMDB where key-value pairs are stored. 
          Each leaf is an entry that stores an operation updating a key's value alongside some metadata. 
          Entries are append-only and immutable. The QMDB key is generated by hashing the application-level key.
        </li>
        <li>
          <strong>Twigs:</strong> Subtrees with fixed depth and entry count. Additionally, twigs store a 
          bitmap at the twig root which represents the activity status of each of entry in the twig. (Commonware's 
          QMDB implementation has 256 leaves in a twig and therefore a 256-bit bitmap at the twig root)
        </li>
        <li>
          <strong>Upper Nodes:</strong> Can be several levels of nodes that connect twigs.
        </li>
        <li>
          <strong>Shard Roots:</strong> Connects upper nodes to represent the state that is managed by an 
          independent QMDB shard. The QMDB is separated into shards because (1) each shard can be defined 
          by the prefix of keys it contains, allowing the DB to save space by storing only the suffix of 
          the key (the prefix for each shard is already known, for example shard #1 could contain keys with 
          prefix 0xAAA, shard #2 contains keys with prefix 0xAAB, ....) and (2) locking at the per-shard 
          level on CRUD operations will enable greater concurrency than locking on the DB-wide state if 
          no sharding was used.
        </li>
        <li>
          <strong>Global Root:</strong> Connects all of the shard roots to represent the entire world state.
        </li>
      </ul>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig11.png" 
          alt="Fields in a QMDB entry"
        />
        <p className="image-caption">
          Fig. 11: Fields in a QMDB entry.
        </p>
      </div>

      <p>
        Entries have several fields, each of which is necessary for storing information directly related 
        to the entry or for generating a state proof related to the entry. Key, Value, and Version fields are 
        relatively straightforward. IDs are a nonce-like value that allow distinguishing between several 
        entries in the QMDB for the same key. NextKey, OldId, and OldNextKeyId act as 
        pointers to related keys or entries, storing these pointers in the entry itself allows the 
        generation of various types of inclusion, exclusion, and deletion proofs.
      </p>
      <br />
      <p>
        Twigs compress all of their entries into a hash at the twig root level alongside a bitmap for 
        activity status. Therefore, merkleization requires only reads/writes to the global root, shard 
        roots, upper nodes, and twig roots (i.e. the data below the twig root level is not needed for 
        merkleization). All of this data needed for merkleization is small enough to fit in DRAM rather 
        than being stored in SSD. (Section 3, QMDB Whitepaper)
      </p>
      <br />

      <p className="sub-section-header">Twig States</p>
      <br />
      <ul className="definition-list">
        <li>
          <strong>Fresh:</strong> Twig with space for more entries. The twig root and twig entries should 
          live in DRAM because as new entries are appended, hashes throughout the fresh twig will need to 
          be recomputed.
        </li>
        <li>
          <strong>Full:</strong> Twig that has filled its capacity of entries where at least 1 of the 
          entries is active. The twig root will live in DRAM and twig entries can live in SSD.
        </li>
        <li>
          <strong>Inactive:</strong> Full of entries that are all inactive. The twig root will live in 
          SSD and twig entries are ideally deleted.
        </li>
        <li>
          <strong>Pruned:</strong> Twig root and all twig entries deleted.
        </li>
      </ul>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig12.png" 
          alt="Twig states diagram"
        />
        <p className="image-caption">
          Fig. 12: Twig states defined for twigs that have a capacity of 2048 entries.
        </p>
      </div>

      <p>
        Twigs cycle through the four states listed above. There is only ever one 'fresh' twig in a QMDB 
        shard, and new entries are sequentially inserted into the fresh twig until it is 'full'. All of 
        the entries in a full twig can be flushed to SSD in a sequential write and deleted from DRAM. 
        Remember that merkleization does not require updating nodes below the twig root, so once a twig 
        is full, we only need to keep the twig root in DRAM.
      </p>
      <br />
      <p>
        After all of the entries in a full twig are marked inactive, the twig as a whole transitions to 'inactive'. Entries in inactive twigs can be 
        deleted from SSD because these operations are no longer in use, however, the twig root still 
        needs to live in SSD so that the QMDB structure can be reconstructed. Finally, the entire inactive 
        twig can be deleted, transitioning the twig to 'pruned', and the QMDB is reconstructed without 
        the pruned twig. Upper nodes that contain only pruned twigs below can also be recursively pruned 
        to further compact the QMDB.
      </p>
      <br />
      <p>
        Since the QMDB grows in size with new operations, we are motivated to accelerate the twig 
        lifecycle and delete old entries. This can be done by removing old entries and re-appending 
        them to the fresh twig (process previously described above), allowing more opportunities to 
        prune subtrees.
      </p>
      <br />

      <p className="sub-section-header">QMDB Indexer</p>
      <br />
      <p>
        LayerZero's whitepaper includes an in-memory indexer which maps application-level keys to 
        their latest entry in the MMR. This indexer is implemented as a B-Tree which allows iterating 
        over keys by lexicographic order, a necessary feature to generate exclusion proofs (more on this later). 
        Commonware provides several varying implementations of QMDB, including versions which build 
        the indexer with a simple hash map but are incapable of generating exclusion proofs.
      </p>
      <br />

      <div className="image-container">
        <img 
          src="/qmdb_fig13.png" 
          alt="B-Tree indexer"
        />
        <p className="image-caption">
          Fig. 13: Example of what a simple B-Tree looks like. It is out of scope to explain how 
          it works here, but find several resources online. Starting at the root, it is O(log n) to 
          find an item stored in the tree. Also, you have the ability to traverse items sequentially 
          by value in the B-Tree.
        </p>
      </div>

      <p className="sub-section-header">CRUD Operations</p>
      <p className="sub-reference">(White paper section 3.3)</p>
      <br />
      <p>
        QMDB supports Create, Read, Update, and Delete capabilities on key-value pairs in the database. 
        In this section I'll walk through the details of how each of these works. For the moment, we 
        will ignore an entry's Id, Version, and Value fields because these aren't relevant. So each 
        entry E will be defined as:
      </p>
      <br />
      <p className="code-block">
        E = (Key, NextKey, OldId, OldNextKeyId)
      </p>
      <br />

      <p><strong>Read:</strong> When reading the value associated with a key, first query the indexer 
        by the key you are searching for, that will return the location in SSD of the key's latest 
        QMDB entry. Use this location to read the entry and retrieve the key's value in a single SSD I/O.
      </p>
      <br />

      <p><strong>Update:</strong> Requires first reading the most recent update for the key, flipping 
        it to inactive, then appending a new entry to the Fresh twig. That is 1 SSD read and 1 entry write. 
        For an existing entry E, the new entry E' updating the key's value would be:
      </p>
      <br />
      <p className="code-block">
        E' = (E.Key, E.NextKey, E.Id, E.OldNextKeyId)
      </p>
      <p className="formula-note">
        (Where E.Key is entry E's key, E.NextKey is entry E's NextKey, etc.)
      </p>
      <br />
      <p>
        Since E' is updating the same Key as E, they both share E.Key.
      </p>
      <br />
      <p>
        Since the NextKey value is defined as the "Lexicographic successor of Key", the NextKey value 
        is the same in E and E'. In a little more detail, say we have a QMDB that stores values for 
        two keys 0xA and 0xB and say E is an existing entry for key 0xA. Key 0xA's lexicographic 
        successor is 0xB in the QMDB, so E.NextKey == 0xB. When E' is appended to the QMDB to update 
        key 0xA's value, the lexicographic successor of the key updated by E' is the same as E, i.e. 
        the NextKey value is the same in E and E'.
      </p>
      <br />
      <p>
        Since the OldId value is defined as the Id of the entry that last modified Key, the OldId of 
        E' must be E's Id, E.Id.
      </p>
      <br />
      <p>
        Lastly, as a part of this entry write, we must flip the active bit of the existing entry E 
        to inactive at the twig root level (this is done in memory).
      </p>
      <br />

      <p><strong>Create:</strong> Involves appending a new entry corresponding to the key-value pair 
        being created and updating an existing entry whose NextKey should be the newly created Key. 
        The 'update' is required because the new key in the data structure needs to fit into its 
        lexicographically correct position among the chain of NextKey pointers stored in entries.
      </p>
      <br />
      <p>
        For example: there may be an existing key 0xA that stores its next lexicographic key as 
        another existing key 0xC, but if 0xB is created, the key 0xA should now point at 0xB which 
        should point at 0xC.
      </p>
      <br />
      <p>
        So the first step is to read in the entry Eₚ corresponding to the lexicographic predecessor 
        (prevKey) to the created key K. Right now, the entry Eₚ stores some Eₚ.nextKey, the created 
        key K must satisfy: Eₚ &lt; K &lt; Eₚ.nextKey. Now we must 'update' the entry Eₚ to make K 
        its lexicographic successor and append K with Eₚ.nextKey as its successor. So after flipping 
        the active bit of Eₚ to false, we append these two entries to the fresh twig:
      </p>
      <br />
      <p className="code-block">
        Eₖ = (K, Eₚ.nextKey, Eₚ.Id, Eₙ.Id)<br />
        Eₚ' = (prevKey, K, Eₚ.Id, Eₙ.OldId)
      </p>
      <br />
      <p>
        So now the lexicographic successor of key of Eₚ has been updated in Eₚ' to be K while the 
        lexicographic successor of Eₖ is now Eₚ.nextKey (again remember that K is being created in 
        an existing tree where Eₚ &lt; K &lt; Eₚ.nextKey). The oldId for Eₚ' is set to Eₚ.Id. The 
        oldId for Eₖ is also set to Eₚ.Id despite the fact that K is a new key which has no previous Id.
      </p>
      <br />
      <p>
        So a Create operation requires two entry writes for both newly appended entries along with 
        one SSD read to retrieve the lexicographic predecessor of the created key.
      </p>
      <br />

      <p><strong>Delete:</strong> This operation is straightforward and the whitepaper explains it nicely:
      </p>
      <br />
      <p className="quote">
        "Delete is implemented by first setting the activeBit to false for the most current entry 
        corresponding to K, then updating the entry for prevKey. First, the entries Eₖ and Eₚ 
        corresponding to the keys K and prevKey are read from SSD, and the ActiveBits for the twig 
        containing Eₖ is updated. Next, a new entry for prevKey is appended to the fresh twig:
      </p>
      <p className="code-block">
        Eₚ' = (prevKey, Eₖ.nextKey, Eₚ.Id, Eₖ.OldNextKeyId)
      </p>
      <p className="quote">
        Deleting a key in QMDB incurs 2 SSD reads and 1 entry write."
      </p>
      <p className="sub-reference">(Section 3.3, CRUD Interface)</p>
      <br />

      <p className="sub-section-header">Proofs</p>
      <br />
      <p>
        Say QMDB is used by a blockchain to maintain state. If a node wants to prove to others that 
        account X holds a balance of 5 coins, how would it do that? It would need to generate an 
        inclusion proof for the key corresponding to account X. If instead the node wants to prove 
        that account X does not exist in state or has no balance entry, it would need to generate 
        an exclusion proof for the key corresponding to account X. Additionally, we could create 
        historical inclusion/exclusion proofs for the key associated with some account X at any block height H.
      </p>
      <br />
      <p>
        <strong>Inclusion proof:</strong> An inclusion proof for key K is simply the Merkle proof π 
        for entry E such that E.Key = K. This entry E can be obtained by querying the indexer for 
        the latest operation done by K.
      </p>
      <br />
      <p>
        <strong>Exclusion proof:</strong> An exclusion proof for a key K is the Merkle proof π for 
        entry E such that E.Key &lt; K &lt; E.nextKey. Since K != E.nextKey, π proves that K does 
        not exist in the QMDB. Finding E such that E.Key &lt; K &lt; E.nextKey is quite performant 
        if the indexer is a B-tree because the B-tree is built for iteration over the ordered list of keys.
      </p>
      <br />
      <p>
        The OldId and OldNextKeyId can be used to create a historical graph of operations which 
        then can generate historical inclusion & exclusion proofs. Additionally, the entire world 
        state at any previous block height can be reconstructed using the OldId, OldNextKeyId, 
        and Version fields. I won't dive deep into this here because it is a little more niche, 
        but this capability is explained in more detail in the whitepaper (Section 3.4 Proofs).
      </p>
      <br />

      <p id="commonware-storage-qmdb" className="section-header">commonware-storage QMDB</p>
      <p>
        <a href="https://github.com/commonwarexyz/monorepo/tree/main/storage/src/qmdb" target="_blank" rel="noopener noreferrer">QMDB Implementation</a>
        <br />
        <a href="https://docs.rs/commonware-storage/latest/commonware_storage/qmdb/index.html" target="_blank" rel="noopener noreferrer">QMDB Implementation Crate Docs</a>
      </p>
      <br />
      <ul>
        <li><strong>any</strong> - todo</li>
        <li><strong>benches</strong> - todo</li>
        <li><strong>current</strong> - todo</li>
        <li><strong>immutable</strong> - todo</li>
        <li><strong>keyless</strong> - todo</li>
        <li><strong>store</strong> - todo</li>
        <li><strong>sync</strong> - todo</li>
      </ul>
      <br />
    </div>
  );
}

export default QMDBEssay;

